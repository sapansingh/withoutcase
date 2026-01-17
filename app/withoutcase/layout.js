import TopNav from "../component/navigation";

export default function AuthLayout({ children }) {
  return (
    
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      {children}
    </div>
  );
}
