class Council < Formula
  desc "Multi-LLM terminal chat CLI — broadcast prompts to multiple LLMs side-by-side"
  homepage "https://github.com/Nihal-Ahamed-MS/council"
  url "https://github.com/Nihal-Ahamed-MS/council/archive/refs/tags/v0.1.6.tar.gz"
  sha256 "030f9627dd5842bc19d610a83e528d1f23b4d3b1bc22b3a7176b0c7392e177a4"
  license "MIT"
  version "0.1.6"

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
