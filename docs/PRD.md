Product Requirements Document (PRD): Splash Page Performance Optimization
1. Overview
1.1 Purpose
This PRD outlines the requirements for optimizing the performance of the splash page. The page features extensive animations and a Three.js scene (potentially two, with one sourced from Spline). All animations are intentional and must be preserved. The goal is to achieve perfect scores (100/100) across all Lighthouse categories (Performance, Accessibility, Best Practices, and SEO) as the primary milestone, followed by further optimizations to maximize speed and efficiency.
1.2 Scope

In Scope: Optimization of existing code, assets, and rendering processes. Utilization of existing tools like Legend app for state management and React Query where applicable. Implementation of Web Workers for offloading tasks.
Out of Scope: Conversion to a Progressive Web App (PWA). Major redesigns or removal of animations/Three.js scenes. Optimization of the Spline-sourced model (handle separately if needed).

1.3 Stakeholders

Product Owner: [User]
Development Team: Subagents responsible for implementation.

1.4 Assumptions

Current Lighthouse Performance score is 68; this must be improved to 100.
Lighthouse report will be provided as reference.
The page uses React-based technologies, with Legend app already installed for state management.

2. Requirements
2.1 Functional Requirements

Lighthouse Optimization:

Achieve 100/100 scores in:

Performance
Accessibility
Best Practices
SEO


Use the provided Lighthouse report to identify and prioritize issues (e.g., render-blocking resources, unused JavaScript, image optimization).
Focus on core web vitals: Largest Contentful Paint (LCP), First Input Delay (FID), Cumulative Layout Shift (CLS), Time to Interactive (TTI).


State Management Utilization:

Fully leverage the installed Legend app for all state management needs. Ensure no redundant or inefficient state handling outside of Legend.
Integrate React Query for data fetching and caching if it improves performance (e.g., for async operations or API calls).


Three.js Scene Optimization:

Audit and optimize the Three.js scene(s):

Reduce polygon count, texture sizes, and shader complexity where possible without altering visual intent.
Implement lazy loading for scene elements.
Use efficient rendering techniques (e.g., requestAnimationFrame throttling, level-of-detail models).


Note: Spline-sourced scene is separate; flag any Spline-specific optimizations but do not alter core integration.


Animation Optimization:

Preserve all animations as intentional features.
Optimize for smoothness and efficiency:

Use CSS animations/transitions over JavaScript where feasible.
Batch DOM updates to minimize reflows and repaints.
Defer non-critical animations until after initial load.




Web Workers Implementation:

Introduce Web Workers to offload computationally intensive tasks (e.g., animation calculations, data processing, or Three.js computations) from the main thread.
Ensure workers are used judiciously to avoid overhead; test for net performance gains.


General Performance Enhancements:

After achieving Lighthouse 100s, pursue additional optimizations:

Code splitting and lazy loading of components/modules.
Asset compression (images, scripts, styles).
Caching strategies (e.g., service workers for assets, but not full PWA).
Minimize third-party scripts and ensure they are async/deferred.
Profile and reduce main-thread blocking time.





2.2 Non-Functional Requirements

Performance Targets:

Load time: Under 2 seconds on average connections.
Frame rate: Maintain 60 FPS during animations.


Compatibility: Ensure optimizations work across major browsers (Chrome, Firefox, Safari, Edge) and devices (desktop, mobile).
Testing:

Run Lighthouse audits pre- and post-optimization.
Use browser dev tools for profiling (e.g., Performance tab in Chrome).


Security: No changes that introduce vulnerabilities.

3. Deliverables

Optimized codebase with changes documented in commit messages or a changelog.
Before/after Lighthouse reports demonstrating 100/100 scores.
Performance metrics report (e.g., load times, FPS benchmarks).
Any new code (e.g., Web Workers) with comments explaining optimizations.

4. Timeline and Milestones

Milestone 1: Achieve Lighthouse 100s – Target: Immediate turnaround (within hours/days based on subagent capacity).
Milestone 2: Additional optimizations – Follow immediately after Milestone 1.
Overall: Quick iteration expected given current score of 68 in Performance.

5. Risks and Mitigations

Risk: Optimizations break animations or visuals.

Mitigation: Thorough testing; rollback if needed.


Risk: Web Workers add complexity without gains.

Mitigation: A/B test implementations.


Risk: Spline integration conflicts.

Mitigation: Isolate and handle separately.