import { Fragment, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { publicRoutes, privateRoutes } from "@/routes";
import { DefaultLayout } from "@/layouts";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-color)]">
      <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function App() {
  const allRoutes = [...publicRoutes, ...privateRoutes];

  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {allRoutes.map((route, index) => {
            const Page = route.component;

            let Layout = DefaultLayout;
            if (route.layout) {
              Layout = route.layout;
            } else if (route.layout === null) {
              Layout = Fragment;
            }

            const Guard = route.guard || Fragment;

            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <Layout>
                    <Guard>
                      <Page />
                    </Guard>
                  </Layout>
                }
              />
            );
          })}
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
