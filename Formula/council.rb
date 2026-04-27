class Council < Formula
  desc "Multi-LLM terminal chat CLI — broadcast prompts to multiple LLMs side-by-side"
  homepage "https://github.com/Nihal-Ahamed-MS/council"
  url "https://github.com/Nihal-Ahamed-MS/council/archive/refs/tags/v0.1.8.tar.gz"
  sha256 "e1d04ac7d102f3b3baccdc966c238695a058f72c6f25680c03442e6839846aa8"
  license "MIT"
  version "0.1.8"

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
