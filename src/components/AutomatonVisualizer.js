// Import React and necessary hooks
import React, { useEffect, useState } from 'react';
// Import graphics components from react-konva for visual rendering
import { Stage, Layer, Circle, Arrow, Text } from 'react-konva';

/**
 * AutomatonVisualizer Component
 * Visualizes a finite automaton (FA) with states, transitions, and layout adjustments.
 * Props:
 * - automaton: An object containing states, startState, acceptStates, and transitions.
 */
const AutomatonVisualizer = ({ automaton }) => {
  // State to store calculated positions of automaton states on the canvas
  const [statePositions, setStatePositions] = useState({});
  // State to dynamically adjust canvas height for fitting all elements
  const [stageHeight, setStageHeight] = useState(window.innerHeight);

  /**
   * useEffect to calculate positions for states and adjust canvas height dynamically
   * Runs when automaton states or startState changes.
   */
  useEffect(() => {
    const positions = {}; // Holds positions of each state
    const baseRadius = 200; // Base radius for circular layout
    const radius = baseRadius + automaton.states.length * 50; // Adjust radius based on the number of states
    const centerX = window.innerWidth / 2; // X-coordinate of the circle's center
    const centerY = window.innerHeight / 2; // Y-coordinate of the circle's center
    const angleStep = (2 * Math.PI) / (automaton.states.length - 1); // Angular spacing between states
    const verticalOffset = 100; // Extra vertical spacing for better visibility

    let maxY = centerY; // Variable to track the maximum Y-coordinate for canvas height

    // Loop through each state to calculate its position
    automaton.states.forEach((state, index) => {
      if (state === automaton.startState) {
        // Starting state is positioned to the left of the circle
        positions[state] = {
          x: centerX - radius - 50,
          y: centerY,
        };
      } else {
        // Other states are positioned in a circular pattern with vertical spacing
        const angle = (index - 1) * angleStep; // Offset angle to exclude start state
        positions[state] = {
          x: centerX + radius * Math.cos(angle), // X-coordinate based on angle
          y: centerY + radius * Math.sin(angle) + index * verticalOffset, // Y-coordinate with vertical offset
        };
      }

      // Update maxY to ensure all states fit within the canvas
      maxY = Math.max(maxY, positions[state].y + 100); // Add buffer for padding
    });

    setStatePositions(positions); // Update state positions
    setStageHeight(Math.max(maxY + 100, window.innerHeight)); // Adjust canvas height if needed
  }, [automaton.states, automaton.startState]);

  /**
   * Helper function to get inputs for self-loop transitions of a state.
   * @param {string} state - The state to check for self-loops.
   * @returns {Array} Array of inputs for self-loops.
   */
  const getSelfLoopTransitions = (state) => {
    return automaton.transitions
      .filter((transition) => transition.from === state && transition.to === state) // Find self-loop transitions
      .map((transition) => transition.input) // Extract inputs
      .sort(); // Sort inputs alphabetically
  };

  /**
   * Helper function to calculate a point offset from a source position.
   * @param {object} from - Source position with x and y.
   * @param {object} to - Target position with x and y.
   * @param {number} distance - Distance to offset.
   * @returns {object} Offset point with x and y.
   */
  const offsetPoint = (from, to, distance) => {
    const angle = Math.atan2(to.y - from.y, to.x - from.x); // Angle between points
    return {
      x: from.x + distance * Math.cos(angle), // Offset X-coordinate
      y: from.y + distance * Math.sin(angle), // Offset Y-coordinate
    };
  };

  /**
   * Helper function to calculate a point offset towards the source position.
   * @param {object} from - Source position with x and y.
   * @param {object} to - Target position with x and y.
   * @param {number} distance - Distance to offset.
   * @returns {object} Adjusted offset point with x and y.
   */
  const adjustedOffsetPoint = (from, to, distance) => {
    const angle = Math.atan2(to.y - from.y, to.x - from.x); // Angle between points
    return {
      x: to.x - distance * Math.cos(angle), // Adjust X-coordinate
      y: to.y - distance * Math.sin(angle), // Adjust Y-coordinate
    };
  };
// Render the AutomatonVisualizer component
return (
  // Stage represents the drawing canvas with dynamic width and height
  <Stage width={window.innerWidth} height={stageHeight}>
    {/* Layer groups all visual elements like states and transitions */}
    <Layer>
      {/* Render each state in the automaton */}
      {automaton.states.map((state) => {
        const { x, y } = statePositions[state] || {}; // Retrieve coordinates for the state
        const isAcceptState = automaton.acceptStates.includes(state); // Check if the state is an accept (final) state

        return (
          <React.Fragment key={state}>
            {/* Circle representing the state */}
            <Circle
              x={x} // X-coordinate of the state
              y={y} // Y-coordinate of the state
              radius={20} // Size of the state circle
              fill="blue" // State fill color
              stroke={isAcceptState ? 'green' : 'black'} // Green outline for accept states, black for others
              strokeWidth={isAcceptState ? 4 : 2} // Thicker border for accept states
            />
            {/* Label for the state, placed at the center of the circle */}
            <Text
              x={x - 10} // Offset to center text horizontally
              y={y - 5} // Offset to center text vertically
              text={state} // Display the state's name
              fill="white" // White text color
            />
            {/* Arrow indicating the starting state */}
            {state === automaton.startState && (
              <Arrow
                points={[x - 70, y, x - 30, y]} // Line coordinates for the arrow
                fill="red" // Arrowhead fill color
                stroke="red" // Arrow stroke color
                pointerLength={10} // Arrowhead length
                pointerWidth={10} // Arrowhead width
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Render transitions between states */}
      {automaton.transitions.map((transition, index) => {
        const { from, to, input } = transition; // Extract transition details
        const fromPos = statePositions[from]; // Source state position
        const toPos = statePositions[to]; // Target state position
        const arrowOffset = 25; // Offset to position arrows away from state circles
        const textOffset = 30; // Offset to position transition labels

        if (!fromPos || !toPos) return null; // Skip if positions are invalid

        const isSelfLoop = from === to; // Check if the transition is a self-loop

        if (isSelfLoop) {
          // Render self-loop transition
          const loopRadius = 30; // Radius for self-loop path
          const loopOffset = 20; // Label offset for self-loops
          const selfLoopInputs = getSelfLoopTransitions(from).join(", "); // Combine self-loop inputs

          return (
            <React.Fragment key={index}>
              {/* Render a self-loop arrow */}
              <Arrow
                points={[
                  fromPos.x + loopRadius, fromPos.y - loopRadius, // Start of loop
                  fromPos.x + loopRadius * 2, fromPos.y - loopRadius * 1.5, // Curve points
                  fromPos.x + loopRadius, fromPos.y - loopRadius * 2, // End of loop
                  fromPos.x, fromPos.y - loopRadius, // Return to start
                ]}
                tension={0.5} // Smooth curve tension
                stroke="black" // Loop outline color
                fill="black" // Loop fill color
                pointerLength={6} // Arrowhead size
                pointerWidth={6} // Arrowhead width
              />
              {/* Label for the self-loop */}
              <Text
                x={fromPos.x + loopRadius * 1.8} // X-position of label
                y={fromPos.y - loopRadius * 1.8 - loopOffset} // Y-position of label
                text={selfLoopInputs} // Display inputs for the self-loop
                fontSize={14} // Font size
                fill="black" // Text color
              />
            </React.Fragment>
          );
        } else {
          // Render normal transitions between two states
          const startOffsetPos = offsetPoint(fromPos, toPos, arrowOffset); // Adjusted starting point of the arrow
          const adjustedToPos = adjustedOffsetPoint(fromPos, toPos, arrowOffset); // Adjusted target point of the arrow
          const curveOffset = 35; // Offset for a curved path
          const middlePoint = {
            x: (startOffsetPos.x + adjustedToPos.x) / 2 - curveOffset * Math.sign(fromPos.y - toPos.y), // X of curve midpoint
            y: (startOffsetPos.y + adjustedToPos.y) / 2 - curveOffset * Math.sign(toPos.x - fromPos.x), // Y of curve midpoint
          };

          return (
            <React.Fragment key={index}>
              {/* Curved arrow representing the transition */}
              <Arrow
                points={[
                  startOffsetPos.x, startOffsetPos.y, // Starting point
                  middlePoint.x, middlePoint.y, // Curve midpoint
                  adjustedToPos.x, adjustedToPos.y, // Ending point
                ]}
                tension={0.5} // Curve tension
                stroke="black" // Arrow outline color
                fill="black" // Arrow fill color
                pointerLength={10} // Arrowhead size
                pointerWidth={10} // Arrowhead width
              />
              {/* Label for the transition */}
              <Text
                x={middlePoint.x} // X-position of label
                y={middlePoint.y - textOffset} // Y-position of label
                text={input} // Display input symbol for the transition
                fontSize={14} // Font size
                fill="black" // Text color
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
