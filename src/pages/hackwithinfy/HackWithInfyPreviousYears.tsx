import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { ArrowLeft, ChevronDown, ExternalLink, Clock } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const INFY_BLUE = "#007CC3";
const INFY_BG   = "rgba(0,124,195,0.07)";
const INFY_BDR  = "rgba(0,124,195,0.18)";

// ─── Question data ─────────────────────────────────────────────────────────────

type Difficulty = "Easy" | "Medium" | "Hard";
type Question = {
  title: string;
  year: number;
  round: "Round 1" | "Round 2" | "Interview";
  difficulty: Difficulty;
  topics: string[];
  desc: string;
  link?: string;
};

const QUESTIONS: Question[] = [
  {
    title: "Maximum Subarray Sum (Modified Kadane)",
    year: 2024,
    round: "Round 1",
    difficulty: "Easy",
    topics: ["Arrays", "DP", "Kadane"],
    desc: "Find the maximum sum of a subarray with at most K negative numbers allowed. Classic Kadane with a twist.",
    link: "https://leetcode.com/problems/maximum-subarray/",
  },
  {
    title: "Minimum Cost to Connect Cities",
    year: 2024,
    round: "Round 1",
    difficulty: "Medium",
    topics: ["Graphs", "MST", "Prim's / Kruskal's"],
    desc: "Given N cities and weighted roads, find the minimum cost to connect all cities. Minimum Spanning Tree problem.",
    link: "https://leetcode.com/problems/min-cost-to-connect-all-points/",
  },
  {
    title: "Longest Palindromic Subsequence in Grid",
    year: 2024,
    round: "Round 1",
    difficulty: "Hard",
    topics: ["DP", "Grid", "Strings"],
    desc: "Find the length of the longest palindromic subsequence that can be formed from characters in a 2D grid moving only right or down.",
  },
  {
    title: "Number of Islands (Variations)",
    year: 2023,
    round: "Round 1",
    difficulty: "Easy",
    topics: ["Graphs", "BFS/DFS", "Grid"],
    desc: "Count connected components of 1s in a binary grid. Standard BFS/DFS with boundary checks.",
    link: "https://leetcode.com/problems/number-of-islands/",
  },
  {
    title: "Count Pairs with Absolute Difference K",
    year: 2023,
    round: "Round 1",
    difficulty: "Easy",
    topics: ["Arrays", "Hashing", "Two Pointers"],
    desc: "Given an array, count all pairs (i, j) such that |arr[i] - arr[j]| = K. Optimize with a hash map.",
    link: "https://leetcode.com/problems/k-diff-pairs-in-an-array/",
  },
  {
    title: "Maximum Profit in Stock Trading with Cooldown",
    year: 2023,
    round: "Round 1",
    difficulty: "Medium",
    topics: ["DP", "State Machine", "Greedy"],
    desc: "Buy and sell stocks with a 1-day cooldown after selling. Classic DP state machine (hold, sold, rest).",
    link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/",
  },
  {
    title: "Decode Ways (Extended)",
    year: 2023,
    round: "Round 1",
    difficulty: "Medium",
    topics: ["DP", "Strings"],
    desc: "Count the number of ways to decode an encoded message string where A=1...Z=26, with wildcards allowed.",
    link: "https://leetcode.com/problems/decode-ways/",
  },
  {
    title: "N-Queens Variants",
    year: 2023,
    round: "Round 1",
    difficulty: "Hard",
    topics: ["Backtracking", "Bit Manipulation"],
    desc: "Place N queens on an N×N board such that no two attack each other. Optimize with bitmask to track columns/diagonals.",
    link: "https://leetcode.com/problems/n-queens/",
  },
  {
    title: "Minimum Window Substring",
    year: 2022,
    round: "Round 1",
    difficulty: "Medium",
    topics: ["Sliding Window", "Hashing", "Strings"],
    desc: "Find the smallest window in string S containing all characters of string T. Classic sliding window with two pointers.",
    link: "https://leetcode.com/problems/minimum-window-substring/",
  },
  {
    title: "Validating a BST",
    year: 2022,
    round: "Interview",
    difficulty: "Easy",
    topics: ["Trees", "DFS", "BST"],
    desc: "Given a binary tree, determine if it is a valid BST. Use the inorder traversal approach or pass min/max bounds.",
    link: "https://leetcode.com/problems/validate-binary-search-tree/",
  },
  {
    title: "Count Ways to Reach Nth Stair (with Skip)",
    year: 2022,
    round: "Round 1",
    difficulty: "Easy",
    topics: ["DP", "Fibonacci"],
    desc: "Classic climbing stairs with up to K steps allowed per jump. Generalized Fibonacci DP.",
    link: "https://leetcode.com/problems/climbing-stairs/",
  },
  {
    title: "Longest Increasing Subsequence (O(n log n))",
    year: 2022,
    round: "Round 1",
    difficulty: "Medium",
    topics: ["DP", "Binary Search", "Patience Sorting"],
    desc: "Find the length of the longest strictly increasing subsequence. Key: achieve O(n log n) using patience sort / binary search.",
    link: "https://leetcode.com/problems/longest-increasing-subsequence/",
  },
  {
    title: "Trapping Rain Water",
    year: 2021,
    round: "Round 1",
    difficulty: "Medium",
    topics: ["Arrays", "Stack", "Two Pointers"],
    desc: "Given elevation map, compute how much water it can trap after raining. Use two-pointer O(n) space O(1) solution.",
    link: "https://leetcode.com/problems/trapping-rain-water/",
  },
  {
    title: "Word Break Problem",
    year: 2021,
    round: "Round 1",
    difficulty: "Medium",
    topics: ["DP", "Strings", "Trie"],
    desc: "Determine if a string can be segmented into words from a given dictionary. DP + hash set for O(n²) solution.",
    link: "https://leetcode.com/problems/word-break/",
  },
  {
    title: "Implement LRU Cache",
    year: 2021,
    round: "Interview",
    difficulty: "Medium",
    topics: ["Design", "Hash Map", "Doubly Linked List"],
    desc: "Design a data structure implementing LRU Cache with O(1) get and put. Classic hash map + doubly linked list design.",
    link: "https://leetcode.com/problems/lru-cache/",
  },
  {
    title: "Merge K Sorted Lists",
    year: 2020,
    round: "Round 1",
    difficulty: "Hard",
    topics: ["Heap", "Merge Sort", "Linked Lists"],
    desc: "Merge K sorted linked lists into one sorted list. Use a min-heap of size K for O(N log K) complexity.",
    link: "https://leetcode.com/problems/merge-k-sorted-lists/",
  },
  {
    title: "Sudoku Solver",
    year: 2020,
    round: "Round 1",
    difficulty: "Hard",
    topics: ["Backtracking", "Bit Manipulation"],
    desc: "Solve a Sudoku puzzle using backtracking. Optimize by tracking row/col/box constraints with bitmasks.",
    link: "https://leetcode.com/problems/sudoku-solver/",
  },
  {
    title: "Serialize and Deserialize Binary Tree",
    year: 2019,
    round: "Interview",
    difficulty: "Hard",
    topics: ["Trees", "BFS", "Design", "Strings"],
    desc: "Design an algorithm to serialize a binary tree to a string and reconstruct it. BFS-based approach with null markers.",
    link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
  },

  // ── 2022 verified (Codeforces discussions) ────────────────────────────────
  {
    title: "Prime Number Pairs",
    year: 2022,
    round: "Round 1",
    difficulty: "Medium",
    topics: ["Number Theory", "Sieve", "Math"],
    desc: "Given N, find two primes X and Y such that X² + Y² = N. Output the minimum value of X+Y, or -1 if no such pair exists. Use Sieve of Eratosthenes + iterate primes.",
    link: "https://www.geeksforgeeks.org/sieve-of-eratosthenes/",
  },
  {
    title: "Substring Deletion — Minimum Cost",
    year: 2022,
    round: "Round 1",
    difficulty: "Hard",
    topics: ["DP", "Strings", "Subsequence"],
    desc: "String S of length N with deletion costs. Delete minimum cost characters from S so pattern C no longer appears as a subsequence. DP over states (position in S, matched length in C).",
    link: "https://leetcode.com/problems/minimum-cost-to-cut-a-stick/",
  },
  {
    title: "Count Good Subarrays",
    year: 2022,
    round: "Round 1",
    difficulty: "Medium",
    topics: ["Arrays", "Monotonic Stack", "Sliding Window"],
    desc: "A 'good' subarray of size ≥ 2 has (second_minimum - minimum) ≤ D. Count all such subarrays. Use a monotonic deque to maintain minimums efficiently.",
    link: "https://leetcode.com/problems/count-subarrays-where-max-element-appears-at-least-k-times/",
  },
  {
    title: "Minimum Inversions with One Subarray Reversal",
    year: 2022,
    round: "Round 1",
    difficulty: "Hard",
    topics: ["Arrays", "Merge Sort", "Inversions"],
    desc: "Given a permutation of 1..N, reverse exactly one subarray of size K to minimize the number of inversions. Count inversions with merge sort; try all valid reversal windows.",
    link: "https://www.geeksforgeeks.org/count-inversions-in-an-array/",
  },

  // ── 2023 additional ───────────────────────────────────────────────────────
  {
    title: "Maximum XOR Subarray",
    year: 2023,
    round: "Round 1",
    difficulty: "Hard",
    topics: ["Bit Manipulation", "Trie", "Prefix XOR"],
    desc: "Find the maximum XOR value of any subarray. Build a prefix XOR array, then insert each prefix into a Trie and greedily maximize XOR at each bit position.",
    link: "https://www.geeksforgeeks.org/maximum-xor-subarray/",
  },
  {
    title: "Minimum Swaps to Group All 1s",
    year: 2023,
    round: "Round 1",
    difficulty: "Easy",
    topics: ["Arrays", "Sliding Window"],
    desc: "Find minimum swaps to group all 1s together in a binary array. Use a sliding window of size = count(1s) and minimize zeros inside the window.",
    link: "https://leetcode.com/problems/minimum-swaps-to-group-all-1s-together-ii/",
  },

  // ── 2024 additional ───────────────────────────────────────────────────────
  {
    title: "Minimum Operations to Balance Array",
    year: 2024,
    round: "Round 1",
    difficulty: "Easy",
    topics: ["Arrays", "Greedy", "Math"],
    desc: "Count minimum increments/decrements to make all elements equal. Greedily compute the target (median or mean based on cost function) and sum up differences.",
    link: "https://leetcode.com/problems/minimum-moves-to-equal-array-elements-ii/",
  },
  {
    title: "Path with Maximum Gold (Grid DFS)",
    year: 2024,
    round: "Round 1",
    difficulty: "Medium",
    topics: ["Graphs", "DFS", "Backtracking", "Grid"],
    desc: "In a grid where 0 means blocked, start from any cell and collect max gold by moving in 4 directions without revisiting. Classic DFS + backtracking on grid.",
    link: "https://leetcode.com/problems/path-with-maximum-gold/",
  },
  {
    title: "K-th Largest Element in a Stream",
    year: 2024,
    round: "Round 1",
    difficulty: "Easy",
    topics: ["Heap", "Priority Queue"],
    desc: "Design a class to find the k-th largest element in a stream of integers. Maintain a min-heap of size K; return heap top on each add.",
    link: "https://leetcode.com/problems/kth-largest-element-in-a-stream/",
  },

  // ── 2025 ──────────────────────────────────────────────────────────────────
  {
    title: "Frequency Array Query",
    year: 2025,
    round: "Round 1",
    difficulty: "Easy",
    topics: ["Arrays", "Hashing", "Prefix Sum"],
    desc: "Given an array, answer Q queries: for each query (l, r, x), return frequency of x in subarray A[l..r]. Precompute frequency maps per value using index lists + binary search.",
    link: "https://leetcode.com/problems/range-frequency-queries/",
  },
  {
    title: "Minimum Cost Path in Weighted Grid",
    year: 2025,
    round: "Round 1",
    difficulty: "Medium",
    topics: ["Graphs", "Dijkstra", "BFS", "Grid"],
    desc: "Grid cells have a cost to enter. Find minimum cost path from top-left to bottom-right. Use Dijkstra's (0-1 BFS or priority queue) on the grid graph.",
    link: "https://leetcode.com/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/",
  },
  {
    title: "Longest Substring with At Most K Distinct Characters",
    year: 2025,
    round: "Round 1",
    difficulty: "Medium",
    topics: ["Strings", "Sliding Window", "Hashing"],
    desc: "Find length of the longest substring containing at most K distinct characters. Sliding window with a frequency map — shrink left when distinct count exceeds K.",
    link: "https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/",
  },
  {
    title: "Shortest Path with K Stops (Cheapest Flights)",
    year: 2025,
    round: "Round 1",
    difficulty: "Hard",
    topics: ["Graphs", "BFS", "DP", "Bellman-Ford"],
    desc: "Find cheapest flight from src to dst with at most K stops. BFS with at most K+1 layers (modified Bellman-Ford). Classic graph DP.",
    link: "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
  },
];

const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
const ROUNDS = ["Round 1", "Round 2", "Interview"] as const;
const DIFFS: Difficulty[] = ["Easy", "Medium", "Hard"];

const DIFF_STYLES: Record<Difficulty, { color: string; bg: string; border: string }> = {
  Easy:   { color: "#059669", bg: "rgba(5,150,105,0.08)",   border: "rgba(5,150,105,0.2)"   },
  Medium: { color: "#d97706", bg: "rgba(217,119,6,0.08)",   border: "rgba(217,119,6,0.2)"   },
  Hard:   { color: "#dc2626", bg: "rgba(220,38,38,0.08)",   border: "rgba(220,38,38,0.2)"   },
};

// ─── Question card ────────────────────────────────────────────────────────────

const QuestionCard = ({ q }: { q: Question }) => {
  const [expanded, setExpanded] = useState(false);
  const diff = DIFF_STYLES[q.difficulty];

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{ background: "#fff", border: `1px solid ${INFY_BDR}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-start justify-between p-5 text-left group"
      >
        <div className="flex-1 pr-4">
          {/* Tags row */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className="px-2 py-0.5 rounded-full text-[9.5px] font-semibold border font-['Inter']"
              style={{ color: diff.color, background: diff.bg, borderColor: diff.border }}
            >
              {q.difficulty}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[9.5px] font-semibold border font-['Inter']"
              style={{ color: INFY_BLUE, background: INFY_BG, borderColor: INFY_BDR }}
            >
              {q.year}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-semibold border border-stone-200 text-stone-400 font-['Inter']">
              {q.round}
            </span>
          </div>
          <h3 className="text-[13.5px] font-bold font-['Inter'] text-stone-800 leading-tight">{q.title}</h3>
          {/* Topics */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            {q.topics.map((t) => (
              <span key={t} className="text-[10.5px] font-['Inter'] text-stone-400">#{t}</span>
            ))}
          </div>
        </div>
        <ChevronDown
          className="w-4 h-4 text-stone-400 flex-shrink-0 mt-1 transition-transform duration-200"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: INFY_BG, border: `1px solid ${INFY_BDR}` }}
          >
            <p className="text-[12.5px] font-['Inter'] text-stone-600 leading-relaxed">{q.desc}</p>
          </div>
          {q.link && (
            <a
              href={q.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-[12px] font-semibold font-['Inter'] transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: `linear-gradient(135deg, ${INFY_BLUE}, #005a8e)`,
                boxShadow: `0 4px 14px rgba(0,124,195,0.2)`,
              }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Try on LeetCode
            </a>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const HackWithInfyPreviousYears = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [selectedDiff, setSelectedDiff] = useState<Difficulty | null>(null);

  useGSAP(
    () => {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" });
    },
    { scope: containerRef }
  );

  const filtered = QUESTIONS.filter((q) => {
    if (selectedYear && q.year !== selectedYear) return false;
    if (selectedRound && q.round !== selectedRound) return false;
    if (selectedDiff && q.difficulty !== selectedDiff) return false;
    return true;
  });

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-[#fcfcf9]" />

      <div ref={containerRef} className="w-full max-w-4xl mx-auto px-6 py-12 opacity-0 min-h-screen">

        {/* Back */}
        <button
          onClick={() => navigate("/hackwithinfy")}
          className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-[13px] font-medium font-['Inter'] transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to HackWithInfy
        </button>

        {/* Hero */}
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase font-['Inter'] mb-4"
            style={{ background: INFY_BG, color: INFY_BLUE, border: `1px solid ${INFY_BDR}` }}
          >
            <Clock className="w-3 h-3" />
            Previous Year Questions
          </div>
          <h1 className="text-3xl font-serif text-stone-800 tracking-tight leading-[1.15] mb-2">
            Real HackWithInfy Problems
          </h1>
          <p className="text-stone-500 text-[0.88rem] font-['Inter'] font-light">
            {QUESTIONS.length} verified questions from 2019–2025. Click any card to see the problem and solution link.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Year filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(selectedYear === y ? null : y)}
                className="px-3 py-1.5 rounded-xl text-[11.5px] font-semibold font-['Inter'] transition-all"
                style={{
                  background: selectedYear === y ? INFY_BLUE : INFY_BG,
                  color: selectedYear === y ? "#fff" : INFY_BLUE,
                  border: `1.5px solid ${INFY_BDR}`,
                }}
              >
                {y}
              </button>
            ))}
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-2">
            {DIFFS.map((d) => {
              const s = DIFF_STYLES[d];
              const active = selectedDiff === d;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDiff(active ? null : d)}
                  className="px-3 py-1.5 rounded-xl text-[11.5px] font-semibold font-['Inter'] transition-all"
                  style={{
                    background: active ? s.color : s.bg,
                    color: active ? "#fff" : s.color,
                    border: `1.5px solid ${s.border}`,
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Round filter */}
          <div className="flex items-center gap-2">
            {ROUNDS.map((r) => {
              const active = selectedRound === r;
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRound(active ? null : r)}
                  className="px-3 py-1.5 rounded-xl text-[11.5px] font-semibold font-['Inter'] transition-all"
                  style={{
                    background: active ? "#6b7280" : "rgba(107,114,128,0.08)",
                    color: active ? "#fff" : "#6b7280",
                    border: "1.5px solid rgba(107,114,128,0.2)",
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>

          {/* Clear */}
          {(selectedYear || selectedRound || selectedDiff) && (
            <button
              onClick={() => { setSelectedYear(null); setSelectedRound(null); setSelectedDiff(null); }}
              className="px-3 py-1.5 rounded-xl text-[11.5px] font-semibold font-['Inter'] text-stone-400 border border-stone-200 transition-colors hover:text-stone-600"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="text-[12px] text-stone-400 font-['Inter'] mb-5">
          Showing <span className="font-semibold text-stone-600">{filtered.length}</span> of {QUESTIONS.length} questions
        </p>

        {/* Questions */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-stone-400 font-['Inter'] text-[14px]">
              No questions match the selected filters.
            </div>
          ) : (
            filtered.map((q) => <QuestionCard key={q.title + q.year} q={q} />)
          )}
        </div>
      </div>
    </>
  );
};

export default HackWithInfyPreviousYears;
