import React, { useState } from 'react';

const AutomatonInput = ({ onSubmit }) => {
  // State variables to manage form inputs and results
  const [type, setType] = useState('DFA'); // Default automaton type: DFA
  const [states, setStates] = useState(''); // Comma-separated states
  const [alphabet, setAlphabet] = useState(''); // Comma-separated alphabet
  const [transitions, setTransitions] = useState(''); // Transition rules in "from,input,to" format
  const [startState, setStartState] = useState(''); // Starting state
  const [acceptStates, setAcceptStates] = useState(''); // Accepting states (comma-separated)
  const [testString, setTestString] = useState(''); // Input string for testing
  const [result, setResult] = useState(null); // Result of the string test
  const [showTestString, setShowTestString] = useState(false); // Toggles visibility of test string section

  // Function to validate the automaton configuration
  const validateAutomaton = (automaton) => {
    const { type, states, alphabet, transitions, startState, acceptStates } = automaton;

    // Ensure the start state is valid
    if (!states.includes(startState)) {
      alert(`Start state "${startState}" must be one of the defined states.`);
      return false;
    }

    // Ensure all accept states are valid
    for (const acceptState of acceptStates) {
      if (!states.includes(acceptState)) {
        alert(`Accept state "${acceptState}" must be one of the defined states.`);
        return false;
      }
    }

    // Validate each transition
    for (const transition of transitions) {
      const { from, input, to } = transition;
      if (!states.includes(from) || !alphabet.includes(input) || !states.includes(to)) {
        alert(`Transition "${from},${input},${to}" is invalid. Ensure all states and inputs exist.`);
        return false;
      }

      // For DFA, ensure no duplicate transitions for the same input
      if (type === 'DFA') {
        const fromTransitions = transitions.filter(t => t.from === from && t.input === input);
        if (fromTransitions.length > 1) {
          alert(`DFA cannot have multiple transitions for "${from}" on input "${input}".`);
          return false;
        }
      }
    }
    return true;
  };

  // Simulates the automaton to check if a string is accepted
  const simulateAutomaton = (string, automaton) => {
    const { type, states, alphabet, transitions, startState, acceptStates } = automaton;

    if (type === 'DFA') {
      let currentState = startState; // Start from the initial state
      for (const char of string) {
        // Find the transition for the current state and input
        const transition = transitions.find(t => t.from === currentState && t.input === char);
        if (!transition) return false; // Reject if no valid transition
        currentState = transition.to; // Move to the next state
      }
      return acceptStates.includes(currentState); // Accept if the final state is accepting
    } else if (type === 'NFA') {
      // Recursive function to explore all possible paths
      const explore = (currentStates, index) => {
        if (index === string.length) return currentStates.some(state => acceptStates.includes(state));
        const nextChar = string[index];
        let nextStates = [];
        for (const state of currentStates) {
          // Get all possible transitions for the current state and input
          nextStates = nextStates.concat(
            transitions.filter(t => t.from === state && t.input === nextChar).map(t => t.to)
          );
        }
        return explore([...new Set(nextStates)], index + 1); // Remove duplicates and continue
      };
      return explore([startState], 0); // Start exploration from the initial state
    }
  };

  // Handles the form submission to parse and validate the automaton
  const handleSubmit = (e) => {
    e.preventDefault();

    // Parse form inputs into usable data structures
    const parsedStates = states.split(',').map((s) => s.trim());
    const parsedAlphabet = alphabet.split(',').map((s) => s.trim());
    const parsedTransitions = transitions
      .split(';')
      .map((t) => {
        const [from, input, to] = t.split(',').map((s) => s.trim());
        return { from, input, to };
      });
    const parsedAcceptStates = acceptStates.split(',').map((s) => s.trim());

    // Construct automaton object
    const automaton = {
      type,
      states: parsedStates,
      alphabet: parsedAlphabet,
      transitions: parsedTransitions,
      startState: startState.trim(),
      acceptStates: parsedAcceptStates,
    };

    // Validate and proceed if valid
    if (validateAutomaton(automaton)) {
      onSubmit(automaton); // Notify parent component
      setShowTestString(true); // Show test string section
    }
  };

  // Handles testing of a string against the automaton
  const handleTestString = () => {
    const parsedStates = states.split(',').map((s) => s.trim());
    const parsedAlphabet = alphabet.split(',').map((s) => s.trim());
    const parsedTransitions = transitions
      .split(';')
      .map((t) => {
        const [from, input, to] = t.split(',').map((s) => s.trim());
        return { from, input, to };
      });
    const parsedAcceptStates = acceptStates.split(',').map((s) => s.trim());

    const automaton = {
      type,
      states: parsedStates,
      alphabet: parsedAlphabet,
      transitions: parsedTransitions,
      startState: startState.trim(),
      acceptStates: parsedAcceptStates,
    };

    const isAccepted = simulateAutomaton(testString, automaton); // Simulate automaton
    setResult(isAccepted ? 'Accepted' : 'Rejected'); // Set the result
  };
return (
  <div style={{ padding: '20px' }}>
    {/* Automaton Configuration Form */}
    <form onSubmit={handleSubmit}>
      
      {/* Dropdown to select the automaton type (DFA or NFA) */}
      <div>
        <label>Type (DFA/NFA):</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="DFA">DFA</option>
          <option value="NFA">NFA</option>
        </select>
      </div>

      {/* Input field for states (comma separated) */}
      <div>
        <label>States (comma separated):</label>
        <input
          type="text"
          value={states}
          onChange={(e) => setStates(e.target.value)}
          placeholder="e.g., q0, q1, q2"
        />
      </div>

      {/* Input field for the alphabet (comma separated) */}
      <div>
        <label>Alphabet (comma separated):</label>
        <input
          type="text"
          value={alphabet}
          onChange={(e) => setAlphabet(e.target.value)}
          placeholder="e.g., a, b, c"
        />
      </div>

      {/* Input field for transitions (semicolon-separated list with format: from,input,to) */}
      <div>
        <label>Transitions (format: from,input,to;):</label>
        <input
          type="text"
          value={transitions}
          onChange={(e) => setTransitions(e.target.value)}
          placeholder="e.g., q0,a,q1; q1,b,q2"
        />
      </div>

      {/* Input field for the start state */}
      <div>
        <label>Start State:</label>
        <input
          type="text"
          value={startState}
          onChange={(e) => setStartState(e.target.value)}
          placeholder="e.g., q0"
        />
      </div>

      {/* Input field for accept states (comma separated) */}
      <div>
        <label>Accept States (comma separated):</label>
        <input
          type="text"
          value={acceptStates}
          onChange={(e) => setAcceptStates(e.target.value)}
          placeholder="e.g., q2"
        />
      </div>

      {/* Button to submit the automaton configuration */}
      <button type="submit">Submit Automaton</button>
    </form>

    <hr />

    {/* Conditionally rendered test string input section */}
    {showTestString && (
      <div>
        {/* Input section for testing a string against the automaton */}
        <h3>Test Input String</h3>
        <input
          type="text"
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter string to test"
        />
        {/* Button to trigger the string testing */}
        <button onClick={handleTestString}>Test String</button>
        
        {/* Display the result of the test */}
        {result && <p>Result: {result}</p>} {/* Show the result of the test string */}
      </div>
    )}
  </div>
);
};

export default AutomatonInput;

