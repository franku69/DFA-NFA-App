import React, { useEffect, useState } from 'react';
import { Stage, Layer, Circle, Arrow, Text } from 'react-konva';

const AutomatonVisualizer = ({ automaton }) => {
  const [statePositions, setStatePositions] = useState({});
  const [stageHeight, setStageHeight] = useState(window.innerHeight);

  useEffect(() => {
    const positions = {};
    const baseRadius = 200;
    const radius = baseRadius + automaton.states.length * 50; // Increase spacing based on state count
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const angleStep = (2 * Math.PI) / (automaton.states.length - 1); // Exclude starting state from circular layout
    const verticalOffset = 100; // Adjust this for more vertical spacing

    let maxY = centerY; // Track max Y-coordinate for dynamic height adjustment

    automaton.states.forEach((state, index) => {
      if (state === automaton.startState) {
        // Position the starting state on the left side
        positions[state] = {
          x: centerX - radius - 50, // Offset left from the circle
          y: centerY,
        };
      } else {
        // Position other states in a circular pattern with additional vertical offset
        const angle = (index - 1) * angleStep; // Offset index for correct circular position
        positions[state] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle) + index * verticalOffset, // Add vertical spacing
        };
      }

      // Update maxY to dynamically set height based on the bottom-most state
      maxY = Math.max(maxY, positions[state].y + 100); // Add buffer for visual clarity
    });

    setStatePositions(positions);
    setStageHeight(Math.max(maxY + 100, window.innerHeight)); // Expand height as needed
  }, [automaton.states, automaton.startState]);

  const getSelfLoopTransitions = (state) => {
    return automaton.transitions
      .filter((transition) => transition.from === state && transition.to === state)
      .map((transition) => transition.input)
      .sort();
  };

  const offsetPoint = (from, to, distance) => {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    return {
      x: from.x + distance * Math.cos(angle),
      y: from.y + distance * Math.sin(angle),
    };
  };

  const adjustedOffsetPoint = (from, to, distance) => {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    return {
      x: to.x - distance * Math.cos(angle),
      y: to.y - distance * Math.sin(angle),
    };
  };

  return (
    <Stage width={window.innerWidth} height={stageHeight}>
      <Layer>
        {automaton.states.map((state) => {
          const { x, y } = statePositions[state] || {};
          const isAcceptState = automaton.acceptStates.includes(state);

          return (
            <React.Fragment key={state}>
              <Circle
                x={x}
                y={y}
                radius={20}
                fill="blue"
                stroke={isAcceptState ? 'green' : 'black'}
                strokeWidth={isAcceptState ? 4 : 2}
              />
              <Text x={x - 10} y={y - 5} text={state} fill="white" />
              {state === automaton.startState && (
                <Arrow
                  points={[x - 70, y, x - 30, y]}
                  fill="red"
                  stroke="red"
                  pointerLength={10}
                  pointerWidth={10}
                />
              )}
            </React.Fragment>
          );
        })}

        {automaton.transitions.map((transition, index) => {
          const { from, to, input } = transition;
          const fromPos = statePositions[from];
          const toPos = statePositions[to];
          const arrowOffset = 25;
          const textOffset = 30;

          if (!fromPos || !toPos) return null;

          const isSelfLoop = from === to;

          if (isSelfLoop) {
            const loopRadius = 30;
            const loopOffset = 20;
            const selfLoopInputs = getSelfLoopTransitions(from).join(", ");

            return (
              <React.Fragment key={index}>
                <Arrow
                  points={[
                    fromPos.x + loopRadius, fromPos.y - loopRadius,
                    fromPos.x + loopRadius * 2, fromPos.y - loopRadius * 1.5,
                    fromPos.x + loopRadius, fromPos.y - loopRadius * 2,
                    fromPos.x, fromPos.y - loopRadius
                  ]}
                  tension={0.5}
                  stroke="black"
                  fill="black"
                  pointerLength={6}
                  pointerWidth={6}
                />
                <Text
                  x={fromPos.x + loopRadius * 1.8}
                  y={fromPos.y - loopRadius * 1.8 - loopOffset}
                  text={selfLoopInputs}
                  fontSize={14}
                  fill="black"
                />
              </React.Fragment>
            );
          } else {
            const startOffsetPos = offsetPoint(fromPos, toPos, arrowOffset);
            const adjustedToPos = adjustedOffsetPoint(fromPos, toPos, arrowOffset);
            const curveOffset = 35;
            const middlePoint = {
              x: (startOffsetPos.x + adjustedToPos.x) / 2 - curveOffset * Math.sign(fromPos.y - toPos.y),
              y: (startOffsetPos.y + adjustedToPos.y) / 2 - curveOffset * Math.sign(toPos.x - fromPos.x),
            };

            return (
              <React.Fragment key={index}>
                <Arrow
                  points={[
                    startOffsetPos.x, startOffsetPos.y,
                    middlePoint.x, middlePoint.y,
                    adjustedToPos.x, adjustedToPos.y
                  ]}
                  tension={0.5}
                  stroke="black"
                  fill="black"
                  pointerLength={10}
                  pointerWidth={10}
                />
                <Text
                  x={middlePoint.x}
                  y={middlePoint.y - textOffset}
                  text={input}
                  fontSize={14}
                  fill="black"
                />
              </React.Fragment>
            );
          }
        })}
      </Layer>
    </Stage>
  );
};

export default AutomatonVisualizer;
