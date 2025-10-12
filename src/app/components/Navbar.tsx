import Link from 'next/link';

const Navbar = () => {
  return (
    <div className="fixed top-8 right-8 z-50">
      <Link
        className="bg-black/40 backdrop-blur-md border border-purple-500/30 text-purple-100 px-8 py-3 rounded-lg font-mono text-sm tracking-widest uppercase hover:border-purple-400 hover:text-white hover:bg-purple-900/20 transition-all duration-200 shadow-2xl"
    href="/login"
      >
        Login
      </Link>
      
    </div>
  );
};

export default Navbar;