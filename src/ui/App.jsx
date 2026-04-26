import React from 'react';
import { Box, useApp, useInput, useStdout } from 'ink';
import { StatusBar } from './StatusBar.jsx';
import { ModelPanel } from './ModelPanel.jsx';
import { PromptBar } from './PromptBar.jsx';
import { streamModel } from '../adapters/index.js';

export function App({ models, mode }) {
  const { exit } = useApp();
  const { stdout } = useStdout();

  const [focusIndex, setFocusIndex] = React.useState(0);
  // panelState: { [modelId]: { tokens: string[], error: string|null, streaming: bool } }
  const [panelState, setPanelState] = React.useState(() =>
    Object.fromEntries(models.map((m) => [m.id, { tokens: [], error: null, streaming: false }]))
  );
  const [isStreaming, setIsStreaming] = React.useState(false);

  const termWidth = stdout?.columns ?? 120;
  const panelWidth = Math.floor(termWidth / models.length);

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit();
      return;
    }
    if (key.leftArrow) setFocusIndex((i) => Math.max(0, i - 1));
    if (key.rightArrow) setFocusIndex((i) => Math.min(models.length - 1, i + 1));
  });

  async function handleSubmit(prompt) {
    if (isStreaming) return;
    setIsStreaming(true);

    // reset panels
    setPanelState(
      Object.fromEntries(
        models.map((m) => [
          m.id,
          {
            tokens: [],
            error: null,
            streaming: m.available !== false,
          },
        ])
      )
    );

    const messages = [{ role: 'user', content: prompt }];

    await Promise.allSettled(
      models
        .filter((m) => m.available !== false)
        .map(async (model) => {
          try {
            for await (const token of streamModel(model.id, messages)) {
              setPanelState((prev) => ({
                ...prev,
                [model.id]: {
                  ...prev[model.id],
                  tokens: [...prev[model.id].tokens, token],
                },
              }));
            }
            setPanelState((prev) => ({
              ...prev,
              [model.id]: { ...prev[model.id], streaming: false },
            }));
          } catch (err) {
            setPanelState((prev) => ({
              ...prev,
              [model.id]: {
                ...prev[model.id],
                streaming: false,
                error: err.message,
              },
            }));
          }
        })
    );

    setIsStreaming(false);
  }

  const activeCount = models.filter((m) => m.available !== false).length;

  return (
    <Box flexDirection="column" height={stdout?.rows ?? 40}>
      <StatusBar mode={mode} activeCount={activeCount} totalCount={models.length} />

      <Box flexDirection="row" flexGrow={1}>
        {models.map((model, i) => {
          const state = panelState[model.id];
          return (
            <ModelPanel
              key={model.id}
              model={model}
              tokens={state.tokens}
              error={state.error}
              isStreaming={state.streaming}
              isFocused={focusIndex === i}
              width={panelWidth}
            />
          );
        })}
      </Box>

      <PromptBar onSubmit={handleSubmit} disabled={isStreaming} />
    </Box>
  );
}
