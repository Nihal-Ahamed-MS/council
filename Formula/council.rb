class Council < Formula
  desc "Multi-LLM terminal chat CLI — broadcast prompts to multiple LLMs side-by-side"
  homepage "https://github.com/Nihal-Ahamed-MS/council"
  # Update url + sha256 after each GitHub release
  url "https://github.com/Nihal-Ahamed-MS/council/archive/refs/tags/v0.1.0.tar.gz"
  sha256 "FILL_IN_AFTER_RELEASE"
  license "MIT"
  version "0.1.0"

  depends_on "node"

  def install
    # Install npm dependencies and build the standalone bundle
    system "npm", "install", "--production=false", "--ignore-scripts", "--no-audit", "--no-fund"
    system "node", "build.mjs"

    # Ship the bundle + gateway config into the Cellar
    libexec.install "dist", "gateway", "package.json"

    # Write a launcher script that sets COUNCIL_ROOT to the Cellar path
    (bin/"council").write <<~SHELL
      #!/bin/bash
      export COUNCIL_ROOT="#{libexec}"
      exec node "#{libexec}/dist/council.js" "$@"
    SHELL
  end

  test do
    # Should print usage/error when no config exists
    output = shell_output("#{bin}/council 2>&1", 1)
    assert_match "council setup", output
  end
end
