{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = {nixpkgs, ...}: let
    forSystems = fn:
      nixpkgs.lib.genAttrs [
        "aarch64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
        "x86_64-linux"
      ] (system: fn nixpkgs.legacyPackages.${system});
    defaultForSystems = fn: forSystems (pkgs: {default = fn pkgs;});
  in {
    devShells = defaultForSystems (
      pkgs:
        with pkgs;
          mkShell {
            nativeBuildInputs = [nodejs_20 yarn vips pkg-config flyctl];
            shellHook = ''
              export LD_LIBRARY_PATH="${lib.makeLibraryPath [vips]}:$LD_LIBRARY_PATH"
            '';
          }
    );

    packages = forSystems (pkgs: let
      site = pkgs.callPackage ./site.nix {};
      container = pkgs.callPackage ./container.nix {inherit site;};
    in {
      inherit site container;
      default = site;
    });
  };
}
