import { useSession } from 'next-auth/react';
import { Game } from '../../../models/Game';

import { GameTeamUser } from '../../../models/GameTeamUser';
import { PaginatedSubmission } from '../../../models/PaginatedSubmissions';
import { SessionUser } from '../../../models/SessionUser';
import { GameService } from '../../../services/GameService';
import { GameTeamService } from '../../../services/GameTeamService';
import useSWRInfinite from 'swr/infinite';

import FeedCard from './FeedCard';
import FeedCardSkeleton from './FeedCardSkeleton';
import useLoading from '../../../hooks/use-loading';
import { useState } from 'react';

type Props = {
  currentTeam: GameTeamUser;
  game: Game;
  forMyTeam?: boolean;
};

export default function FeedList({ currentTeam, game, forMyTeam = false }: Props) {
  const session = useSession();
  const user = session?.data?.user as SessionUser;
  const gameService = new GameService(user?.access_token);
  const teamService = new GameTeamService(user?.access_token);
  const [{ isLoading, load, finish }] = useLoading(false);
  const [canLoadMore, setCanLoadMore] = useState(false);

  const { data, size, setSize } = useSWRInfinite(
    (pageIndex, previousPageData: PaginatedSubmission | null) => {
      const page = pageIndex + 1;

      if (previousPageData) {
        const lastPage = previousPageData.last_page ?? previousPageData.meta?.last_page ?? -1;
        if (page > lastPage) return null;
      }

      return forMyTeam ? ['my_team_feeds', pageIndex + 1] : ['feeds', pageIndex + 1];
    },
    async (_, page) => {
      load();
      const subs = forMyTeam
        ? await teamService.getAllSubmissions(game.id, currentTeam.game_team_id, page)
        : await gameService.getAllSubmissions(game.id, page);
      finish();

      const limitWhenFetchingSubmissions = 5;
      if (subs.data.length < limitWhenFetchingSubmissions) setCanLoadMore(false);
      else setCanLoadMore(true);

      return subs;
    },
  );

  if (!data) {
    return (
      <ul className='grid grid-cols-1 gap-3 mx-3 mt-3 pb-12'>
        {[1, 2, 3].map((sub) => (
          <FeedCardSkeleton key={sub} />
        ))}
      </ul>
    );
  }

  if (data[0].data.length === 0)
    return <div className='border rounded p-4 mx-3 text-center'>No submissions yet...</div>;

  return (
    <section className='mx-3 pb-12'>
      <ul className='grid grid-cols-1 gap-4'>
        {data
          ?.flatMap((d) => d.data)
          .map((submission) => (
            <FeedCard currentTeam={currentTeam} submission={submission} key={submission.id} />
          ))}
      </ul>

      {canLoadMore && (
        <button
          disabled={isLoading}
          onClick={() => setSize(size + 1)}
          className={`w-full text-white btn mt-4 ${isLoading ? 'btn-disabled' : 'btn-secondary'}`}>
          Load More
        </button>
      )}
    </section>
  );
}
