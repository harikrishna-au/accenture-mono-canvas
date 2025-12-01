import { cn } from "@/lib/utils";
import { TileState, Matrix3x3, SHAPE_SIZE } from "@/puzzle/matrix/types";

interface FlowTileProps {
    tile: TileState;
    matrix: Matrix3x3;
    selected: boolean;
    onSelect: () => void;
}

export const FlowTile = ({ tile, matrix, selected, onSelect }: FlowTileProps) => {
    return (
        <div
            onClick={onSelect}
            className={cn(
                "relative grid cursor-pointer gap-0 transition-all duration-200",
                "h-24 w-24 sm:h-28 sm:w-28",
                selected
                    ? "z-10 ring-4 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    : "hover:brightness-110",
            )}
            style={{
                gridTemplateColumns: `repeat(${SHAPE_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${SHAPE_SIZE}, 1fr)`,
            }}
        >
            {matrix.map((row, r) =>
                row.map((symbol, c) => {
                    const isWall = symbol === "x";
                    const isRoad = symbol === "0";
                    const isArrow = !isWall && !isRoad;

                    return (
                        <div
                            key={`${r}-${c}`}
                            className={cn(
                                "flex items-center justify-center text-xs font-bold transition-colors duration-200",
                                isWall ? "bg-neutral-800" : "bg-white",
                                isArrow ? "text-blue-600" : "text-transparent",
                            )}
                        >
                            {isArrow && (
                                <span
                                    className="transform transition-transform"
                                >
                                    {symbol === "1" && "→"}
                                    {symbol === "-1" && "←"}
                                    {symbol === "v" && "↓"}
                                    {symbol === "^" && "↑"}
                                </span>
                            )}
                        </div>
                    );
                }),
            )}


        </div>
    );
};
