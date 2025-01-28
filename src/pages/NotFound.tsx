import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
        Back to Home
      </Link>
      <div className="mt-8">
        <img 
          src="/lovable-uploads/8ef99244-a049-43de-a377-a00253510856.png" 
          alt="Creche Spots"
          className="max-w-xs"
        />
      </div>
    </div>
  );
};

export default NotFound;
