import React, { useState } from 'react';

const AutomatonInput = ({ onSubmit }) => {
  const [type, setType] = useState('DFA'); // Default to DFA
  const [states, setStates] = useState('');
  const [alphabet, setAlphabet] = useState('');
  const [transitions, setTransitions] = useState('');
  const [startState, setStartState] = useState('');
  const [acceptStates, setAcceptStates] = useState('');
  const [testString, setTestString] = useState(''); // For testing individual strings
  const [result, setResult] = useState(null); // Display result of the test string
  const [showTestString, setShowTestString] = useState(false); // Control visibility

  const validateAutomaton = (automaton) => {
    const { type, states, alphabet, transitions, startState, acceptStates } = automaton;

    if (!states.includes(startState)) {
      alert(`Start state "${startState}" must be one of the defined states.`);
      return false;
    }

    for (const acceptState of acceptStates) {
      if (!states.includes(acceptState)) {
        alert(`Accept state "${acceptState}" must be one of the defined states.`);
        return false;
      }
    }

    for (const transition of transitions) {
      const { from, input, to } = transition;
      if (!states.includes(from) || !alphabet.includes(input) || !states.includes(to)) {
        alert(`Transition "${from},${input},${to}" is invalid. Ensure all states and inputs exist.`);
        return false;
      }

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

  const simulateAutomaton = (string, automaton) => {
    const { type, states, alphabet, transitions, startState, acceptStates } = automaton;
    
    if (type === 'DFA') {
      let currentState = startState;
      for (const char of string) {
        const transition = transitions.find(t => t.from === currentState && t.input === char);
        if (!transition) return false; // Reject if no valid transition
        currentState = transition.to;
      }
      return acceptStates.includes(currentState);
    } else if (type === 'NFA') {
      // NFA simulation with recursion to allow multiple paths
      const explore = (currentStates, index) => {
        if (index === string.length) return currentStates.some(state => acceptStates.includes(state));
        const nextChar = string[index];
        let nextStates = [];
        for (const state of currentStates) {
          nextStates = nextStates.concat(
            transitions.filter(t => t.from === state && t.input === nextChar).map(t => t.to)
          );
        }
        return explore([...new Set(nextStates)], index + 1);
      };
      return explore([startState], 0);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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

    if (validateAutomaton(automaton)) {
      onSubmit(automaton);
      setShowTestString(true); // Show test string section after submission
    }
  };

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

    const isAccepted = simulateAutomaton(testString, automaton);
    setResult(isAccepted ? 'Accepted' : 'Rejected');
  };

  return (
    <div style={{ padding: '20px' }}>     
      <form onSubmit={handleSubmit}>
        <div>
          <label>Type (DFA/NFA):</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="DFA">DFA</option>
            <option value="NFA">NFA</option>
          </select>
        </div>
        <div>
          <label>States (comma separated):</label>
          <input
            type="text"
            value={states}
            onChange={(e) => setStates(e.target.value)}
            placeholder="e.g., q0, q1, q2"
          />
        </div>
        <div>
          <label>Alphabet (comma separated):</label>
          <input
            type="text"
            value={alphabet}
            onChange={(e) => setAlphabet(e.target.value)}
            placeholder="e.g., a, b, c"
          />
        </div>
        <div>
          <label>Transitions (format: from,input,to;):</label>
          <input
            type="text"
            value={transitions}
            onChange={(e) => setTransitions(e.target.value)}
            placeholder="e.g., q0,a,q1; q1,b,q2"
          />
        </div>
        <div>
          <label>Start State:</label>
          <input
            type="text"
            value={startState}
            onChange={(e) => setStartState(e.target.value)}
            placeholder="e.g., q0"
          />
        </div>
        <div>
          <label>Accept States (comma separated):</label>
          <input
            type="text"
            value={acceptStates}
            onChange={(e) => setAcceptStates(e.target.value)}
            placeholder="e.g., q2"
          />
        </div>
        <button type="submit">Submit Automaton</button>
      </form>
      <hr />
      {showTestString && (
        <div>
          <h3>Test Input String</h3>
          <input
            type="text"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter string to test"
          />
          <button onClick={handleTestString}>Test String</button>
          {result && <p>Result: {result}</p>}
        </div>
      )}
    </div>
  );
};

export default AutomatonInput;
