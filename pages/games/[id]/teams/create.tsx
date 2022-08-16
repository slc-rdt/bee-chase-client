import { GetServerSideProps, NextPage } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useLoading from '../../../../hooks/use-loading';
import {
  redirectToHome,
  redirectToLogin,
  redirectToPlay,
} from '../../../../lib/server-redirect-helper';
import { CreateGameTeamDto } from '../../../../models/dto/game-teams/create-team.dto';
import { Game } from '../../../../models/Game';
import { SessionUser } from '../../../../models/SessionUser';
import { GameService } from '../../../../services/GameService';
import { GameTeamService } from '../../../../services/GameTeamService';
import Layout from '../../../../widgets/Layout';
import { authOptions } from '../../../api/auth/[...nextauth]';

type FormData = {
  name: string;
  code: number;
};

type Props = {
  game: Game;
};

const CreateTeamPage: NextPage<Props> = ({ game }) => {
  const session = useSession();
  const user = session?.data?.user as SessionUser;
  const gameTeamService = new GameTeamService(user?.access_token);

  const router = useRouter();
  const { id } = router.query;
  const [{ isLoading, load, finish }] = useLoading(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    const MAX = 9999;
    const MIN = 1000;
    const randomAccessCode = Math.floor(Math.random() * (MAX - MIN)) + MIN;

    setValue('name', user?.name);
    setValue('code', randomAccessCode);
  }, [user, setValue]);

  const onSubmit = handleSubmit(async ({ name, code }) => {
    const dto: CreateGameTeamDto = {
      color: null,
      name,
      access_code: code ? code.toString() : null,
    };

    await toast.promise(createTeamAndJoin(dto), {
      success: (createdTeam) => {
        router.replace(`/games/${game.id}/teams`);
        return 'Team created!';
      },
      loading: 'Creating team...',
      error: (e) => {
        return e.response.data.message;
      },
    });
  });

  const createTeamAndJoin = async (dto: CreateGameTeamDto) => {
    const createdTeam = await gameTeamService.create(game.id, dto);
    await gameTeamService.join(game.id, createdTeam.id, dto.access_code);
  };

  return (
    <Layout controlSpacing={false}>
      <div className='relative'>
        <div style={{ background: '#0394c4' }} className='h-32 -mt-1'></div>
        <div className='h-32'>
          <div className='absolute bottom-10 w-full'>
            <div className='w-full rounded-full h-32 w-32 mx-auto bg-gray-300'></div>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className='w-full px-4'>
        <div className='form-control w-full'>
          <label className='label'>
            <span className='label-text uppercase font-semibold uppercase text-gray-400'>
              Team Name
            </span>
          </label>
          <input
            type='text'
            {...register('name', { required: true })}
            placeholder='Team Name'
            className='input input-bordered w-full input-md'
          />
          {errors?.name && <small className='text-red-300'>Team name must be filled</small>}
        </div>

        <div className='form-control w-full mt-4'>
          <label className='label'>
            <span className='label-text uppercase font-semibold uppercase text-gray-400'>
              Access Code
            </span>
          </label>
          <input
            type='number'
            {...register('code', {
              validate: (value) => {
                console.log({ value });
                if (value) return value >= 1000 && value <= 9999;
                else return true;
              },
              valueAsNumber: true,
            })}
            placeholder='Access Code'
            className='input input-bordered w-full input-md'
          />
          {errors?.code?.type == 'validate' && (
            <small className='text-red-300'>Access code must be exactly 4 characters</small>
          )}
        </div>

        <button type='submit' className='btn btn-primary w-full text-white mt-4'>
          Create Team & Join GAme
        </button>
      </form>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) return redirectToLogin();

  const { id } = params as any;
  const user = session.user as SessionUser;
  const gameService = new GameService(user.access_token);
  const teamService = new GameTeamService(user.access_token);

  const game = await gameService.get(id);

  if (!game || !game.allow_user_create_team) return redirectToHome();

  const alreadyInTeam = await teamService.checkUserAlreadyInTeam(game.id);
  if (alreadyInTeam) return redirectToPlay(game.id);

  return {
    props: {
      game,
    },
  };
};

export default CreateTeamPage;