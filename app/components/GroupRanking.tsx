'use client';

interface RankingItem {
  student_id: string;
  student_name?: string;
  student_email: string;
  averageScore: number;
  testCount: number;
  rank: number;
}

interface GroupRankingProps {
  rankings: RankingItem[];
  groupName?: string;
}

export default function GroupRanking({ rankings, groupName }: GroupRankingProps) {
  if (rankings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
        <p className="text-slate-600">No ranking data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      {groupName && (
        <h2 className="text-lg font-medium text-slate-800 mb-4">{groupName} Ranking</h2>
      )}
      <div className="space-y-3">
        {rankings.map((item, index) => (
          <div
            key={item.student_id}
            className={`flex items-center justify-between p-4 rounded-lg ${
              index === 0 ? 'bg-yellow-50 border-2 border-yellow-200' :
              index === 1 ? 'bg-slate-50 border-2 border-slate-200' :
              index === 2 ? 'bg-orange-50 border-2 border-orange-200' :
              'bg-slate-50 border border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                index === 1 ? 'bg-slate-300 text-slate-800' :
                index === 2 ? 'bg-orange-300 text-orange-900' :
                'bg-slate-200 text-slate-700'
              }`}>
                {item.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">
                  {item.student_name || item.student_email}
                </p>
                <p className="text-xs text-slate-500">{item.testCount} tests</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-slate-800">
                {item.averageScore.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

