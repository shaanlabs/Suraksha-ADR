import { Outlet, Route, Routes } from "react-router-dom";
import { SiteHeader } from "./components/SiteHeader";
import { HomePage } from "./pages/HomePage";
import { ReportPage } from "./pages/ReportPage";
import { InfoPage } from "./pages/InfoPage";

function Layout() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <footer className="site-foot">
        <div className="wrap">
          <p>
            Suraksha synthetic pharmacovigilance training pack. Every case is fictional and de-identified. These
            forms are for educational intake practice, not clinical care or a regulatory submission.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/cases/:caseId" element={<ReportPage />} />
        <Route path="/about" element={<InfoPage page="about" />} />
        <Route path="/methodology" element={<InfoPage page="methodology" />} />
        <Route path="/privacy" element={<InfoPage page="privacy" />} />
        <Route path="/contact" element={<InfoPage page="contact" />} />
      </Route>
    </Routes>
  );
}
