
import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to root page which is now the landing page
  return <Navigate to="/" replace />;
};

export default Index;
