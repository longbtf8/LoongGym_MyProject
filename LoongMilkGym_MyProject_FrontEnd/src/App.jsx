import { Fragment, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { publicRoutes, privateRoutes } from "@/routes";
import { DefaultLayout } from "@/layouts";
import LoadingScreen from "@/components/LoadingScreen";

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
    <Router>
      <ScrollToTop />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
        {allRoutes.map((route, index) => {
          const Page = route.component;

          // Xác định Layout sử dụng
          let Layout = DefaultLayout;
          if (route.layout) {
            Layout = route.layout;
          } else if (route.layout === null) {
            Layout = Fragment; // NoLayout (Không có Layout)
          }

          // Xác định Guard sử dụng
          const Guard = route.guard || Fragment;

          return (
            <Route
              key={index}
              path={route.path}
              element={
                <Guard>
                  <Layout>
                    <Page />
                  </Layout>
                </Guard>
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
