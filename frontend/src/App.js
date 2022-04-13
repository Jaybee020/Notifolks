import { Suspense } from "react";
import stores from "./store/stores";
import MainApp from "./sections/MainApp";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider as ReduxProvider, useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";

const renderLoader = () => <p></p>;

const RootComponent = () => {
  const darkTheme = useSelector((state) => state.status.darkTheme);
  return (
    <>
      <div className={!!darkTheme ? "container dark_theme" : "container"}>
        <BrowserRouter>
          <MainApp />
        </BrowserRouter>
      </div>
    </>
  );
};

const App = () => {
  const queryClient = new QueryClient();
  return (
    <Suspense fallback={renderLoader()}>
      <ReduxProvider store={stores}>
        <QueryClientProvider client={queryClient}>
          <RootComponent />
        </QueryClientProvider>
      </ReduxProvider>
    </Suspense>
  );
};

export default App;
