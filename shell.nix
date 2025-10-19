{
  pkgs ?
    import <nixpkgs> {
      overlays = [
        rust-overlay.overlays.default
      ];
    },
  rust-overlay ? builtins.getFlake "github:oxalica/rust-overlay",
}: let
  rustToolchain = pkgs.rust-bin.stable.latest.default.override {
    extensions = ["rust-src"];
  };
in
  pkgs.mkShell {
    packages =
      [
        pkgs.livekit
        pkgs.hivemind
        pkgs.pkg-config
        pkgs.cargo-tauri
        rustToolchain
        pkgs.bun
        pkgs.nodejs
        pkgs.openssl
      ]
      ++ (with pkgs; [
        at-spi2-atk
        gobject-introspection
        atkmm
        cairo
        gdk-pixbuf
        glib
        gtk3
        harfbuzz
        librsvg
        libsoup_3
        pango
        webkitgtk_4_1
      ]);
    shellHook = ''
      export DISPLAY=:0
      export GDK_BACKEND=x11
      export WEBKIT_DISABLE_COMPOSITING_MODE=1
    '';
  }
