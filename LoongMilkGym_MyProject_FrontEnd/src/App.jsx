import { Fragment } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { publicRoutes, privateRoutes } from "@/routes";
import { DefaultLayout } from "@/layouts";

function App() {
  const allRoutes = [...publicRoutes, ...privateRoutes];

  return (
    <Router>
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
    </Router>
  );
}

export default App;
