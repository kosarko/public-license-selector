'use strict';

const fs = require('fs');
const path = require('path');

// Load CoffeeScript license definitions for bag simulation
require('coffeescript/register');
const LicenseDefinitions = require('../src/data/licenses');

/**
 * State Graph Generator for Public License Selector
 *
 * Parses src/data/questions.coffee and generates Mermaid flowcharts
 * showing the decision tree flow for both data and software licensing.
 *
 * Path-specific diagrams simulate the license bag as it flows through the
 * decision tree, annotating edges with filter operations (+cat / −cat) and
 * showing the exact license set reachable at each terminal node.
 */

class StateGraphGenerator {
  constructor() {
    this.states = {};
    this.transitions = [];          // {from, to, label, operations, condition}
    this.terminalStates = [];       // state names with @license
    this.errorStates = [];          // state names with @cantlicense
    this.terminalTransitions = [];  // {from, label, operations, licenseKeys}
    this.errorTransitions = [];     // {from, label, operations}
  }

  // ── Parsing ─────────────────────────────────────────────────────────────────

  parseQuestionsFile(filePath) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    // Strip CoffeeScript line comments so commented-out @goto/@yes/@no lines
    // are not mistakenly parsed as real transitions.
    const content = raw.split('\n').map(l => l.replace(/#.*$/, '')).join('\n');
    const stateFunctionRegex = /(\w+):\s*->\s*\n([\s\S]*?)(?=\n\s{2}\w+:|module\.exports|$)/g;
    let match;
    while ((match = stateFunctionRegex.exec(content)) !== null) {
      this.parseState(match[1], match[2]);
    }
  }

  parseState(stateName, body) {
    const state = {
      name: stateName,
      question: null,
      answers: [],
      options: [],
      hasConditionalLogic: false
    };

    const questionMatch = body.match(/@question\s+['"]([^'"]+)['"]/);
    if (questionMatch) state.question = questionMatch[1];

    const answerRegex = /@answer\s+['"]([^'"]+)['"],\s*->/g;
    let answerMatch;
    while ((answerMatch = answerRegex.exec(body)) !== null) state.answers.push(answerMatch[1]);
    if (body.includes('@yes')) state.answers.push('Yes');
    if (body.includes('@no')) state.answers.push('No');
    if (body.includes('@option')) state.options.push('Multiple license selection');
    if (body.match(/@only|@has|if /)) state.hasConditionalLogic = true;

    // @goto transitions
    const gotoRegex = /@goto\s+['"](\w+)['"]/g;
    let gotoMatch;
    while ((gotoMatch = gotoRegex.exec(body)) !== null) {
      this.transitions.push({
        from: stateName,
        to: gotoMatch[1],
        label: this.inferLabel(body, gotoMatch.index),
        operations: this.getOperationsForAction(body, gotoMatch.index),
        condition: this.getGotoCondition(body, gotoMatch.index)
      });
    }

    // @license terminal transitions — @license\b does NOT match @licensesList
    const licenseRegex = /@license\b([^\n\r]*)/g;
    let licenseMatch;
    while ((licenseMatch = licenseRegex.exec(body)) !== null) {
      if (/^sList/.test(licenseMatch[1])) continue; // belt-and-suspenders skip
      const licenseKeys = this.parseLicenseKeys(licenseMatch[1]);
      this.terminalTransitions.push({
        from: stateName,
        label: this.inferLabel(body, licenseMatch.index),
        operations: this.getOperationsForAction(body, licenseMatch.index),
        licenseKeys: licenseKeys.length > 0 ? licenseKeys : null
      });
    }
    if (/@license\b/.test(body)) this.terminalStates.push(stateName);

    // @cantlicense error transitions
    const cantLicenseRegex = /@cantlicense\b/g;
    let cantMatch;
    while ((cantMatch = cantLicenseRegex.exec(body)) !== null) {
      this.errorTransitions.push({
        from: stateName,
        label: this.inferLabel(body, cantMatch.index),
        operations: this.getOperationsForAction(body, cantMatch.index)
      });
    }
    if (/@cantlicense\b/.test(body)) this.errorStates.push(stateName);

    this.states[stateName] = state;
  }

  parseLicenseKeys(argsStr) {
    const keys = [];
    const re = /['"]([^'"]+)['"]/g;
    let m;
    while ((m = re.exec(argsStr)) !== null) keys.push(m[1]);
    return keys;
  }

  /** Extract @include/@exclude operations from the answer block that contains actionIndex, in source order. */
  getOperationsForAction(body, actionIndex) {
    const before = body.substring(0, actionIndex);
    let blockStart = -1;
    for (const m of before.matchAll(/@(yes|no|answer|option)\b/g)) blockStart = m.index;
    if (blockStart < 0) return [];
    const block = body.substring(blockStart, actionIndex);
    const operations = [];
    for (const m of block.matchAll(/@(include|exclude)\s+['"](\w[\w-]*)['"]/g))
      operations.push({ op: m[1], category: m[2] });
    return operations;
  }

  /**
   * Extract the runtime condition that gates a @goto action.
   *
   * Detects two CoffeeScript patterns:
   *   A) `if @only 'X' … else … @goto`  → goto fires when NOT @only 'X'
   *   B) `[else ]if @has('X') [and @has('Y')…] … @goto`  → goto fires when all @has
   */
  getGotoCondition(body, gotoIndex) {
    const before = body.substring(0, gotoIndex);
    let blockStart = -1;
    for (const m of before.matchAll(/@(yes|no|answer|option)\b/g)) blockStart = m.index;
    if (blockStart < 0) return null;
    const block = body.substring(blockStart, gotoIndex);

    // Pattern A: `if @only 'X'` … `else` … (goto follows else)
    const onlyM = block.match(/if\s+@only\s+['"](\w[\w-]*)['"]/);
    if (onlyM) {
      const afterOnly = block.substring(block.indexOf(onlyM[0]) + onlyM[0].length);
      if (/\belse\b/.test(afterOnly)) {
        return { type: 'not_only', category: onlyM[1] };
      }
    }

    // Pattern B: `[else ]if @has('X') [and @has('Y')…]` — iterate all such clauses in
    // the block so that `else if @has(...)` chains are handled correctly.  The clause
    // containing the goto is the one with no further `else` after it.
    const hasPattern = /(?:else\s+)?if\s+@has\(['"](\w[\w-]*)['"]\)((?:\s+and\s+@has\(['"](\w[\w-]*)['"]\))*)/g;
    for (const hasM of block.matchAll(hasPattern)) {
      const afterMatch = block.substring(hasM.index + hasM[0].length);
      if (!/\belse\b/.test(afterMatch)) { // no further else → goto is in this clause
        const cats = [hasM[1]];
        for (const m of (hasM[2] || '').matchAll(/@has\(['"](\w[\w-]*)['"]\)/g)) cats.push(m[1]);
        if (cats.length === 1) return { type: 'has', category: cats[0] };
        return { type: 'all', conditions: cats.map(c => ({ type: 'has', category: c })) };
      }
    }

    return null;
  }

  /**
   * Infer the edge label by searching backward from actionIndex for the most
   * recent @yes, @no, or @answer declaration.
   */
  inferLabel(body, actionIndex) {
    const before = body.substring(0, actionIndex);
    let lastYes = -1, lastNo = -1, lastAnswerIndex = -1, lastAnswerText = '';
    for (const m of before.matchAll(/@yes\b/g)) lastYes = m.index;
    for (const m of before.matchAll(/@no\b/g)) lastNo = m.index;
    for (const m of before.matchAll(/@answer\s+['"]([^'"]+)['"]/g)) {
      lastAnswerIndex = m.index;
      lastAnswerText = m[1];
    }
    const maxIndex = Math.max(lastYes, lastNo, lastAnswerIndex);
    if (maxIndex >= 0) {
      if (maxIndex === lastYes) return 'Yes';
      if (maxIndex === lastNo) return 'No';
      return lastAnswerText;
    }
    if (before.includes('@option')) return 'Next';
    return '';
  }

  // ── Bag simulation ───────────────────────────────────────────────────────────

  applyOperations(bag, operations) {
    if (bag === null) return null; // runtime-determined bag: propagate unknown
    let current = [...bag];
    for (const { op, category } of (operations || [])) {
      if (op === 'include') current = current.filter(l => (l.categories || []).includes(category));
      else if (op === 'exclude') current = current.filter(l => !(l.categories || []).includes(category));
    }
    return current;
  }

  evaluateCondition(condition, bag) {
    if (!condition) return true;
    if (bag === null) return true; // runtime-determined bag: assume condition fires
    switch (condition.type) {
      case 'only':     return bag.length > 0 && bag.every(l => (l.categories || []).includes(condition.category));
      case 'not_only': return bag.length === 0 || !bag.every(l => (l.categories || []).includes(condition.category));
      case 'has':      return bag.some(l => (l.categories || []).includes(condition.category));
      case 'not_has':  return !bag.some(l => (l.categories || []).includes(condition.category));
      case 'all':      return condition.conditions.every(c => this.evaluateCondition(c, bag));
      default:         return true;
    }
  }

  getInitialBag() {
    return Object.entries(LicenseDefinitions)
      .filter(([, l]) => l.available !== false)
      .map(([key, l]) => ({ ...l, key }));
  }

  isDynamicState(stateName) {
    return stateName === 'LicenseInteropSoftware' || stateName === 'LicenseInteropData';
  }

  /**
   * BFS from KindOfContent following only non-dynamic states' outgoing transitions.
   * Returns the set of states reachable without passing through a dynamic state's goto.
   * Used to avoid double-visiting states that already get a real-bag DFS pass.
   */
  _computeNormallyReachableStates(filterPath) {
    const reachable = new Set();
    const queue = ['KindOfContent'];
    while (queue.length > 0) {
      const state = queue.shift();
      if (reachable.has(state)) continue;
      reachable.add(state);
      if (this.isDynamicState(state)) continue; // don't follow gotos from dynamic states
      for (const t of this.transitions.filter(tr => tr.from === state)) {
        if (this.isInPath(t.to, filterPath) && !reachable.has(t.to))
          queue.push(t.to);
      }
    }
    return reachable;
  }

  /**
   * DFS simulation of the license bag through the decision tree.
   *
   * Returns an array of terminal outcomes:
   *   { from, label, operations, bag, nodeId, isError }
   *
   * Handles conditional branches (@only / @has) by evaluating them against
   * the current bag, so each DFS path gets the correct license set.
   */
  computeTerminalBags(filterPath) {
    const results = [];
    const initialBag = this.getInitialBag();
    // Precompute once: states reachable via non-dynamic paths (get real-bag DFS visits).
    const normallyReachable = this._computeNormallyReachableStates(filterPath);

    const dfs = (stateName, bag, ancestors) => {
      if (!this.isInPath(stateName, filterPath)) return;
      if (ancestors.has(stateName)) return; // cycle guard
      const newAncestors = new Set(ancestors);
      newAncestors.add(stateName);

      if (this.isDynamicState(stateName)) {
        // Emit hardcoded-key terminals
        for (const t of this.terminalTransitions.filter(tr => tr.from === stateName && tr.licenseKeys)) {
          const termBag = t.licenseKeys
            .map(k => LicenseDefinitions[k] ? { ...LicenseDefinitions[k], key: k } : null)
            .filter(Boolean);
          results.push({ from: stateName, label: t.label, operations: t.operations, bag: termBag, nodeId: `Term_${results.length}`, isError: false });
        }
        // Also emit generic @license() terminals (bag computed dynamically at runtime)
        for (const t of this.terminalTransitions.filter(tr => tr.from === stateName && !tr.licenseKeys)) {
          results.push({ from: stateName, label: t.label, operations: t.operations, bag: null, nodeId: `Term_${results.length}`, isError: false });
        }
        for (const t of this.errorTransitions.filter(tr => tr.from === stateName)) {
          results.push({ from: stateName, label: t.label, operations: t.operations, bag: [], nodeId: 'CannotLicense', isError: true });
        }
        // Follow gotos to states exclusively reachable through dynamic states — those won't be
        // visited by the real-bag DFS and need a null-bag visit to emit their terminals.
        for (const t of this.transitions.filter(tr => tr.from === stateName)) {
          if (!this.isInPath(t.to, filterPath)) continue;
          if (normallyReachable.has(t.to)) continue; // covered by real-bag DFS
          dfs(t.to, null, newAncestors);
        }
        return;
      }

      // Terminal transitions: emit when no matching goto fires for this bag
      for (const t of this.terminalTransitions.filter(tr => tr.from === stateName)) {
        const opBag = this.applyOperations(bag, t.operations);
        const matchingGoto = this.transitions.find(
          gt => gt.from === stateName && gt.label === t.label && this.isInPath(gt.to, filterPath)
        );
        // Suppress terminal when the matching goto unconditionally fires, or when the goto
        // condition is @only-based (bag-dependent shortcut) and it currently fires.
        // Do NOT suppress when the goto is @has-based — the terminal is the structural
        // else-branch and must be shown even if the current full bag satisfies the condition.
        const isHasCondition = matchingGoto && matchingGoto.condition &&
          (matchingGoto.condition.type === 'has' || matchingGoto.condition.type === 'all');
        if (matchingGoto && !isHasCondition && this.evaluateCondition(matchingGoto.condition, opBag)) continue;
        if (opBag !== null && opBag.length === 0 && !t.licenseKeys) continue; // phantom empty bag
        const termBag = t.licenseKeys
          ? t.licenseKeys.map(k => LicenseDefinitions[k] ? { ...LicenseDefinitions[k], key: k } : null).filter(Boolean)
          : opBag; // null propagates → shown as "Select License"
        results.push({ from: stateName, label: t.label, operations: t.operations, bag: termBag, nodeId: `Term_${results.length}`, isError: false });
      }

      // Error transitions: same logic
      for (const t of this.errorTransitions.filter(tr => tr.from === stateName)) {
        const opBag = this.applyOperations(bag, t.operations);
        const matchingGoto = this.transitions.find(
          gt => gt.from === stateName && gt.label === t.label && this.isInPath(gt.to, filterPath)
        );
        if (matchingGoto && this.evaluateCondition(matchingGoto.condition, opBag)) continue;
        results.push({ from: stateName, label: t.label, operations: t.operations, bag: [], nodeId: 'CannotLicense', isError: true });
      }

      // Follow goto transitions whose condition is satisfied.
      // For null-bag visits (states only reachable through dynamic states), only continue to
      // further dynamic-exclusive states; skip states covered by the real-bag DFS.
      const seenGotos = new Set();
      for (const t of this.transitions.filter(tr => tr.from === stateName)) {
        if (!this.isInPath(t.to, filterPath)) continue;
        if (bag === null && normallyReachable.has(t.to)) continue; // real-bag DFS covers this
        const newBag = this.applyOperations(bag, t.operations);
        if (bag !== null && !this.evaluateCondition(t.condition, newBag)) continue;
        const gotoKey = `${t.from}:${t.label}:${t.to}`;
        if (seenGotos.has(gotoKey)) continue;
        seenGotos.add(gotoKey);
        dfs(t.to, newBag, newAncestors);
      }
    };

    dfs('KindOfContent', initialBag, new Set());

    // Deduplicate: same (from, label, bag contents) → keep first occurrence
    const seen = new Set();
    return results.filter(r => {
      const fp = r.isError ? 'err' : r.bag === null ? 'dynamic' : r.bag.map(l => l.key).sort().join(',');
      const key = `${r.from}:${r.label}:${fp}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /** Format operations as compact annotations: `+category` / `−category` */
  formatOpsLabel(operations) {
    if (!operations || operations.length === 0) return '';
    return operations.map(op => `${op.op === 'include' ? '+' : '\u2212'}${op.category}`).join(' ');
  }

  /** Format a has/all condition as a compact string, e.g. `has(weak,strong)`. Returns '' for other types. */
  formatCondition(condition) {
    if (!condition) return '';
    if (condition.type === 'has') return `has(${condition.category})`;
    if (condition.type === 'all') return `has(${condition.conditions.map(c => c.category).join(',')})`;
    return '';
  }

  /**
   * Return the condition annotation for an edge going FROM `from` WITH `label`.
   * For goto edges: formats the goto condition.
   * For terminal (else-branch) edges: returns `[else <cond>]` when exactly one
   * conditional has/all goto with the same (from, label) exists, or `[else]`
   * when multiple conditional gotos share the label (the terminal is their joint else).
   */
  elseConditionLabel(from, label) {
    const gotos = this.transitions.filter(t =>
      t.from === from && t.label === label &&
      t.condition && (t.condition.type === 'has' || t.condition.type === 'all')
    );
    if (gotos.length === 0) return '';
    if (gotos.length === 1) {
      const condStr = this.formatCondition(gotos[0].condition);
      return condStr ? `[else ${condStr}]` : '[else]';
    }
    return '[else]';
  }

  /** Format a license bag for display in a terminal node, wrapping at ~36 chars. */
  formatBagNode(bag) {
    if (!bag || bag.length === 0) return 'No valid license';
    const names = bag.map(l => (l.key || '?').toUpperCase());
    const lines = [];
    let current = '';
    for (const name of names) {
      const test = current ? `${current}, ${name}` : name;
      if (test.length > 36 && current) { lines.push(current); current = name; }
      else current = test;
    }
    if (current) lines.push(current);
    return lines.join('\n');
  }

  // ── Mermaid generation ───────────────────────────────────────────────────────

  generateMermaid(options = {}) {
    const { filterPath = null } = options;

    const terminalResults = filterPath ? this.computeTerminalBags(filterPath) : [];

    let mermaid = `%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'16px'}, 'flowchart':{'curve':'basis', 'padding':20}}}%%\n`;
    mermaid += `flowchart TD\n`;
    mermaid += `    Start([Start]) --> KindOfContent\n\n`;

    // Question nodes
    for (const [stateName, state] of Object.entries(this.states)) {
      if (filterPath && !this.isInPath(stateName, filterPath)) continue;
      const nodeShape = this.getNodeShape(stateName);
      const nodeText = state.question || stateName;
      const nodeClass = this.getNodeClass(stateName);
      mermaid += `    ${stateName}${nodeShape[0]}"${this.escapeText(nodeText)}"${nodeShape[1]}\n`;
      if (nodeClass) mermaid += `    class ${stateName} ${nodeClass}\n`;
    }
    mermaid += '\n';

    // Goto transitions with operation annotations
    const processedTransitions = new Set();
    for (const transition of this.transitions) {
      if (filterPath && (!this.isInPath(transition.from, filterPath) || !this.isInPath(transition.to, filterPath))) continue;
      const transKey = `${transition.from}--${transition.label}-->${transition.to}`;
      if (processedTransitions.has(transKey)) continue;
      processedTransitions.add(transKey);
      const opStr = this.formatOpsLabel(transition.operations);
      const condStr = this.formatCondition(transition.condition);
      const parts = [transition.label, opStr, condStr ? `[${condStr}]` : ''].filter(s => s);
      const fullLabel = parts.join(' ');
      const labelStr = fullLabel ? `|"${this.escapeText(fullLabel)}"| ` : '';
      mermaid += `    ${transition.from} -->${labelStr}${transition.to}\n`;
    }

    if (filterPath && terminalResults.length > 0) {
      // Path-specific graphs: distinct terminal/error nodes showing the reachable license bag
      const emittedNodes = new Set();
      for (const r of terminalResults) {
        const opStr = this.formatOpsLabel(r.operations);
        // Only annotate non-error terminals: @cantlicense is an early exit, not the else-branch.
        const elseStr = r.isError ? '' : this.elseConditionLabel(r.from, r.label);
        const parts = [r.label, opStr, elseStr].filter(s => s);
        const fullLabel = parts.join(' ');
        const labelStr = fullLabel ? `|"${this.escapeText(fullLabel)}"| ` : '';
        mermaid += `    ${r.from} -->${labelStr}${r.nodeId}\n`;
        if (!emittedNodes.has(r.nodeId)) {
          emittedNodes.add(r.nodeId);
          if (r.isError) {
            mermaid += `    ${r.nodeId}(["Cannot License"])\n`;
            mermaid += `    class ${r.nodeId} errorNode\n`;
          } else {
            // Use raw newlines in bag label for Mermaid line breaks; only escape quotes.
            // bag===null means the license set is determined dynamically at runtime.
            const bagLabel = r.bag === null
              ? 'Select License'
              : this.formatBagNode(r.bag).replace(/"/g, '\\"');
            mermaid += `    ${r.nodeId}(["${bagLabel}"])\n`;
            mermaid += `    class ${r.nodeId} terminalNode\n`;
          }
        }
      }
    } else {
      // Complete graph: generic End/Error nodes
      const processedTerminal = new Set();
      for (const { from, label, operations } of this.terminalTransitions) {
        if (filterPath && !this.isInPath(from, filterPath)) continue;
        const key = `${from}--${label}-->End`;
        if (processedTerminal.has(key)) continue;
        processedTerminal.add(key);
        const opStr = this.formatOpsLabel(operations);
        const elseStr = this.elseConditionLabel(from, label);
        const parts = [label, opStr, elseStr].filter(s => s);
        const fullLabel = parts.join(' ');
        const labelStr = fullLabel ? `|"${this.escapeText(fullLabel)}"| ` : '';
        mermaid += `    ${from} -->${labelStr}End([Select License])\n`;
      }
      const processedError = new Set();
      for (const { from, label, operations } of this.errorTransitions) {
        if (filterPath && !this.isInPath(from, filterPath)) continue;
        const key = `${from}--${label}-->Error`;
        if (processedError.has(key)) continue;
        processedError.add(key);
        const opStr = this.formatOpsLabel(operations);
        const fullLabel = opStr ? `${label} ${opStr}` : label;
        const labelStr = fullLabel ? `|"${this.escapeText(fullLabel)}"| ` : '';
        mermaid += `    ${from} -->${labelStr}Error([Cannot License])\n`;
      }
    }

    mermaid += '\n';
    mermaid += `    classDef dataPath fill:#e1f5ff,stroke:#01579b,stroke-width:2px,padding:15px,min-width:250px\n`;
    mermaid += `    classDef softwarePath fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,padding:15px,min-width:250px\n`;
    mermaid += `    classDef terminalNode fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px,padding:15px\n`;
    mermaid += `    classDef errorNode fill:#ffcdd2,stroke:#c62828,stroke-width:3px,padding:15px\n`;

    return mermaid;
  }

  getNodeShape(stateName) {
    if (stateName === 'KindOfContent') return ['{', '}'];
    if (this.terminalStates.includes(stateName)) return ['([', '])'];
    if (this.errorStates.includes(stateName)) return ['([', '])'];
    const state = this.states[stateName];
    if (state && state.answers.length === 2 &&
        (state.answers.includes('Yes') || state.answers.includes('No'))) {
      return ['{', '}'];
    }
    return ['[', ']'];
  }

  getNodeClass(stateName) {
    const dataStates = [
      'DataCopyrightable', 'AllOriginal', 'AllowDerivativeWorks',
      'ShareAlike', 'CommercialUse', 'DecideAttribute',
      'EnsureLicensing', 'Changed3dPartyContent', 'LicenseInteropData'
    ];
    const softwareStates = [
      'YourSoftware', 'LicenseInteropSoftware', 'ModifyingOrUsing', 'Copyleft', 'StrongCopyleft'
    ];
    if (dataStates.includes(stateName)) return 'dataPath';
    if (softwareStates.includes(stateName)) return 'softwarePath';
    if (this.terminalStates.includes(stateName)) return 'terminalNode';
    if (this.errorStates.includes(stateName)) return 'errorNode';
    return null;
  }

  isInPath(stateName, pathType) {
    const dataStates = [
      'KindOfContent', 'DataCopyrightable', 'AllOriginal', 'AllowDerivativeWorks',
      'ShareAlike', 'CommercialUse', 'DecideAttribute',
      'EnsureLicensing', 'Changed3dPartyContent', 'LicenseInteropData'
    ];
    const softwareStates = [
      'KindOfContent', 'YourSoftware', 'LicenseInteropSoftware',
      'ModifyingOrUsing', 'Copyleft', 'StrongCopyleft'
    ];
    if (pathType === 'data') return dataStates.includes(stateName);
    if (pathType === 'software') return softwareStates.includes(stateName);
    return true;
  }

  escapeText(text) {
    let cleaned = text
      .replace(/"/g, '\\"')
      .replace(/\n/g, ' ')
      .trim();
    const maxLength = 45;
    if (cleaned.length <= maxLength) return cleaned;
    const words = cleaned.split(' ');
    const lines = [];
    let currentLine = '';
    for (const word of words) {
      if ((currentLine + ' ' + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines.join('\n');
  }

  generateStateTable() {
    let table = '| State | Question | Transitions | Type |\n';
    table += '|-------|----------|-------------|------|\n';
    for (const [stateName, state] of Object.entries(this.states)) {
      const question = state.question || stateName;
      const transitionsFrom = this.transitions
        .filter(t => t.from === stateName)
        .map(t => `→ ${t.to}`)
        .join('<br>');
      let type = 'Question';
      if (this.terminalStates.includes(stateName)) type = '✅ Terminal';
      if (this.errorStates.includes(stateName)) type = '❌ Error';
      if (state.hasConditionalLogic) type += ' (Conditional)';
      table += `| ${stateName} | ${question} | ${transitionsFrom || 'N/A'} | ${type} |\n`;
    }
    return table;
  }

  generateDocumentation() {
    let doc = '# License Selector State Graph\n\n';
    doc += '> **Auto-generated documentation** - Run `npm run generate-graph` to update\n\n';
    doc += '## Overview\n\n';
    doc += 'This document visualizes the decision tree used by the Public License Selector. ';
    doc += 'The selector guides users through a series of questions to recommend appropriate ';
    doc += 'licenses for their software or data.\n\n';
    doc += 'Edge labels on path-specific diagrams include filter operations applied at each step: ';
    doc += '**+category** keeps only licenses with that category; **−category** removes them. ';
    doc += 'Terminal nodes show the exact set of licenses reachable along that path.\n\n';

    doc += '## Complete State Graph\n\n';
    doc += '```mermaid\n';
    doc += this.generateMermaid();
    doc += '```\n\n';

    doc += '## Data Licensing Path\n\n';
    doc += '```mermaid\n';
    doc += this.generateMermaid({ filterPath: 'data' });
    doc += '```\n\n';

    doc += '## Software Licensing Path\n\n';
    doc += '```mermaid\n';
    doc += this.generateMermaid({ filterPath: 'software' });
    doc += '```\n\n';

    doc += '## State Reference Table\n\n';
    doc += this.generateStateTable();
    doc += '\n\n';

    doc += '## Legend\n\n';
    doc += '- 🔹 **Blue nodes**: Data licensing path\n';
    doc += '- 🔸 **Purple nodes**: Software licensing path\n';
    doc += '- ✅ **Green nodes**: Terminal states — license set shown inside node\n';
    doc += '- ❌ **Red nodes**: Error states (cannot license)\n';
    doc += '- ♦️ **Diamond shapes**: Yes/No decisions\n';
    doc += '- ⬜ **Rectangles**: Multi-option questions\n';
    doc += '- **Edge labels**: `+cat` keeps licenses with category; `−cat` removes them\n\n';

    doc += '## How to Update\n\n';
    doc += '1. Modify `src/data/questions.coffee`\n';
    doc += '2. Run `npm run generate-graph`\n';
    doc += '3. Review the updated diagrams in this file\n';
    doc += '4. Commit changes to version control\n\n';

    doc += '## Related Files\n\n';
    doc += '- **Question Definitions**: `src/data/questions.coffee`\n';
    doc += '- **License Data**: `src/data/licenses.coffee`\n';
    doc += '- **Compatibility Matrix**: `src/data/compatibility.coffee`\n';
    doc += '- **Generator Script**: `scripts/generate-state-graph.js`\n';

    return doc;
  }
}

// Main execution
function main() {
  const generator = new StateGraphGenerator();

  // Paths
  const projectRoot = path.resolve(__dirname, '..');
  const questionsFile = path.join(projectRoot, 'src', 'data', 'questions.coffee');
  const outputDir = path.join(projectRoot, 'docs');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Parsing questions.coffee...');
  generator.parseQuestionsFile(questionsFile);

  console.log(`Found ${Object.keys(generator.states).length} states`);
  console.log(`Found ${generator.transitions.length} transitions`);
  console.log(`Found ${generator.terminalStates.length} terminal states`);
  console.log(`Found ${generator.errorStates.length} error states`);

  // Generate outputs
  console.log('\n📝 Generating documentation...');

  const documentation = generator.generateDocumentation();

  // Write documentation file
  const docFile = path.join(outputDir, 'state-graph.md');

  fs.writeFileSync(docFile, documentation);
  console.log(`Created: ${docFile}`);

  console.log('\n Done! View the state graph in docs/state-graph.md');
  console.log(' Tip: GitHub will automatically render Mermaid diagrams');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = StateGraphGenerator;
