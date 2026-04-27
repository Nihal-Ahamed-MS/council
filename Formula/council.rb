class Council < Formula
  desc "Multi-LLM terminal chat CLI — broadcast prompts to multiple LLMs side-by-side"
  homepage "https://github.com/Nihal-Ahamed-MS/council"
  url "https://github.com/Nihal-Ahamed-MS/council/archive/refs/tags/v0.1.0.tar.gz"
  sha256 "PLACEHOLDER_SHA256"
  license "MIT"
  version "0.1.0"

  depends_on "node"

  def install
    system "npm", "install", "--production=false", "--ignore-scripts", "--no-audit", "--no-fund"
    system "node", "build.mjs"
    libexec.install "dist", "gateway", "package.json"
    (bin/"council").write <<~SHELL
      #!/bin/bash
      export COUNCIL_ROOT="#{libexec}"
      exec node "#{libexec}/dist/council.js" "$@"
    SHELL
  end

  test do
    output = shell_output("#{bin}/council 2>&1", 1)
    assert_match "council setup", output
  end
end
