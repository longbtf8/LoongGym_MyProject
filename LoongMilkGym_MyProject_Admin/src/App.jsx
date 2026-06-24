import { Fragment, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { publicRoutes, privateRoutes } from "@/routes";
import { AdminLayout } from "@/layouts";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ToastProvider } from "@/contexts/ToastContext";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function App() {
  const allRoutes = [...publicRoutes, ...privateRoutes];

  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
          {allRoutes.map((route, index) => {
            const Page = route.component;

            let Layout = AdminLayout;
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
    </ToastProvider>
  );
}

export default App;
