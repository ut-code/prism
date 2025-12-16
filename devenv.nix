{pkgs, ...}: let
  rustToolchain = pkgs.rust-bin.stable.latest.default.override {
    extensions = ["rust-src"];
  };
in {
  packages = [
    pkgs.hivemind
    pkgs.pkg-config
    pkgs.cargo-tauri
    rustToolchain
    pkgs.bun
    pkgs.nodejs
    pkgs.openssl
    # GTK/Tauri dependencies
    pkgs.at-spi2-atk
    pkgs.gobject-introspection
    pkgs.atkmm
    pkgs.cairo
    pkgs.gdk-pixbuf
    pkgs.glib
    pkgs.gtk3
    pkgs.harfbuzz
    pkgs.librsvg
    pkgs.libsoup_3
    pkgs.pango
    pkgs.webkitgtk_4_1
  ];

  env = {
    DISPLAY = ":0";
    GDK_BACKEND = "x11";
    WEBKIT_DISABLE_COMPOSITING_MODE = "1";
  };

  processes.web = {
    exec = "bun --env-file=../../.env dev";
    process-compose.working_dir = "./apps/desktop";
  };
  processes.db-migrate = {
    exec = "sleep 2 && bun --env-file=../../.env db:migrate";
    process-compose.working_dir = "./apps/server";
    process-compose.depends_on.postgres.condition = "process_healthy";
  };
  processes.server = {
    exec = "bun --env-file=../../.env dev";
    process-compose.working_dir = "./apps/server";
    process-compose.depends_on.db-migrate.condition = "process_completed_successfully";
  };
  services.postgres = {
    enable = true;
    package = pkgs.postgresql_16;
    initialDatabases = [{name = "prism";}];
    listen_addresses = "127.0.0.1";
  };
}
