import { v } from "convex/values";
import { mutation, query } from "./_generated/server.ts";
import { getFilePerms } from "./perms.ts";

// ファイルのMIMEタイプを検証
function isValidMimeType(mimeType: string): boolean {
  const allowedTypes = [
    // 画像
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // 文書
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // その他
    "application/json",
    "text/csv",
  ];

  return allowedTypes.includes(mimeType);
}

// ファイル名をサニタイズ
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF._-]/g, "_")
    .substring(0, 255);
}

/**
 * アップロード用の署名付きURLを生成
 */
export const generateUploadUrl = mutation({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, { organizationId }) => {
    await getFilePerms(ctx, { organizationId });
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * アップロード後のファイル情報をDBに保存
 */
export const saveFileInfo = mutation({
  args: {
    storageId: v.string(),
    filename: v.string(),
    originalFilename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    organizationId: v.id("organizations"),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId } = await getFilePerms(ctx, {
      organizationId: args.organizationId,
    });

    // ファイルサイズ制限チェック (10MB)
    if (args.size > 10 * 1024 * 1024) {
      throw new Error("ファイルサイズが大きすぎます（最大10MB）");
    }

    // MIMEタイプ検証
    if (!isValidMimeType(args.mimeType)) {
      throw new Error("サポートされていないファイル形式です");
    }

    const sanitizedFilename = sanitizeFilename(args.filename);

    return await ctx.db.insert("files", {
      ...args,
      filename: sanitizedFilename,
      uploadedBy: userId,
      uploadedAt: Date.now(),
    });
  },
});

/**
 * ファイルを削除
 */
export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, { fileId }) => {
    const perms = await getFilePerms(ctx, { fileId });

    if (!perms.delete || !perms.file) {
      throw new Error("ファイルを削除する権限がありません");
    }

    const file = perms.file;

    // ストレージからファイルを削除
    await ctx.storage.delete(file.storageId);

    // データベースからレコードを削除
    await ctx.db.delete(fileId);
  },
});

/**
 * ファイル情報とアクセスURLを取得
 */
export const getFile = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, { fileId }) => {
    const perms = await getFilePerms(ctx, { fileId });
    const file = perms.file;
    if (!file) return null;

    const url = await ctx.storage.getUrl(file.storageId);
    return { ...file, url };
  },
});

/**
 * Organization内のファイル一覧を取得
 */
export const listFiles = query({
  args: {
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { organizationId, limit = 50 }) => {
    await getFilePerms(ctx, { organizationId });

    const files = await ctx.db
      .query("files")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId),
      )
      .order("desc")
      .take(limit);

    return await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.storageId),
      })),
    );
  },
});

/**
 * 複数ファイルの情報とURLを一括取得
 */
export const getFiles = query({
  args: { fileIds: v.array(v.id("files")) },
  handler: async (ctx, { fileIds }) => {
    const results = [];

    for (const fileId of fileIds) {
      try {
        const perms = await getFilePerms(ctx, { fileId });
        const file = perms.file;
        if (!file) continue;

        const url = await ctx.storage.getUrl(file.storageId);
        results.push({ ...file, url });
      } catch {}
    }

    return results;
  },
});
