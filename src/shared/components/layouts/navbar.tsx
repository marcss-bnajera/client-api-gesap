import { FiBell, FiSearch } from "react-icons/fi";

export const Navbar = () => {
    return (
        <header className="bg-white/70 backdrop-blur-md border-b border-blue-100 px-6 h-16 flex items-center justify-between sticky top-0 z-40 shrink-0">
            {/* Search */}
            <div className="flex items-center gap-2.5 bg-[#EBF5FB] border border-blue-100 rounded-xl px-4 py-2 w-72 group focus-within:border-[#00ACC1] focus-within:ring-2 focus-within:ring-[#00ACC1]/20 transition-all">
                <FiSearch className="text-blue-400 shrink-0" size={15} />
                <input
                    placeholder="Buscar en el sistema..."
                    className="bg-transparent text-sm outline-none text-[#0A2647] placeholder:text-slate-400 w-full"
                />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 text-slate-400 hover:text-[#0E6BA8] transition-colors rounded-xl hover:bg-blue-50">
                    <FiBell size={19} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                </button>

                {/* Divider */}
                <div className="w-px h-8 bg-blue-100" />

                {/* User info */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-[#0A2647] leading-tight">Admin Central</p>
                        <p className="text-xs text-slate-400">Administrador del Sistema</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0E6BA8] to-[#00ACC1] flex items-center justify-center text-white text-sm font-bold shadow-md">
                        AC
                    </div>
                </div>
            </div>
        </header>
    );
};
