/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { SloAnalysis } from './pages/SloAnalysis';
import { AssignmentAnalysis } from './pages/AssignmentAnalysis';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/slo" element={<SloAnalysis />} />
        <Route path="/assignment" element={<AssignmentAnalysis />} />
      </Routes>
    </BrowserRouter>
  );
}
