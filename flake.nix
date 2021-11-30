{
  description = "update-flake-lock";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

  outputs =
    { self
    , nixpkgs
    }:
    let
      nameValuePair = name: value: { inherit name value; };
      genAttrs = names: f: builtins.listToAttrs (map (n: nameValuePair n (f n)) names);

      allSystems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = f: genAttrs allSystems
        (system: f {
          inherit system;
          pkgs = import nixpkgs { inherit system; };
        });
    in
    {
      devShell = forAllSystems
        ({ system, pkgs, ... }:
          pkgs.stdenv.mkDerivation {
            name = "update-flake-lock-devshell";
            buildInputs = [ pkgs.shellcheck ];
            src = self;
          });
    };
}
