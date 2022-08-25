import { ChevronLeftIcon, PlusIcon, RefreshIcon, UserCircleIcon } from '@heroicons/react/outline';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { SessionUser } from '../models/SessionUser';

export default function Navbar() {
  const router = useRouter();

  const backBtnAllowedRoutes = [
    '/games/[id]/play',
    '/games/[id]/missions/[missionId]',
    '/join',
    '/games/[id]',
    '/games/[id]/teams',
    '/games/[id]/teams/create',
  ];

  const refreshBtnAllowedRoutes = [
    '/games/[id]/play',
    '/games/[id]/missions/[missionId]',
    '/games/[id]',
    '/games/[id]/teams',
  ];

  const joinBtnAllowedRoutes = ['/'];

  const profileBtnAllowedRoutes = ['/', '/join'];

  const getLeftWidgets = () => {
    return (
      <>
        {backBtnAllowedRoutes.includes(router.pathname) && (
          <button
            tabIndex={0}
            onClick={() => {
              if (router.pathname.includes('play')) router.replace('/');
              else router.back();
            }}
            className='btn btn-square btn-ghost'>
            <ChevronLeftIcon className='w-5 h-5' />
          </button>
        )}
      </>
    );
  };

  const getRightWidgets = () => {
    return (
      <>
        {joinBtnAllowedRoutes.includes(router.pathname) && (
          <button
            tabIndex={0}
            onClick={() => {
              router.push('/join');
            }}
            className='btn btn-square btn-ghost'>
            <PlusIcon className='w-5 h-5' />
          </button>
        )}

        {refreshBtnAllowedRoutes.includes(router.pathname) && (
          <button
            tabIndex={0}
            onClick={() => {
              router.replace(router.asPath);
            }}
            className='btn btn-square btn-ghost'>
            <RefreshIcon className='w-5 h-5' />
          </button>
        )}

        {profileBtnAllowedRoutes.includes(router.pathname) && (
          <div className='dropdown dropdown-end'>
            <label tabIndex={0} className='btn btn-square btn-ghost'>
              <UserCircleIcon className='w-5 h-5' />
            </label>
            <ul
              tabIndex={0}
              className='dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 text-black'>
              <li>
                <button onClick={logOut}>Log out</button>
              </li>
            </ul>
          </div>
        )}
      </>
    );
  };

  const logOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  return (
    <nav className='navbar bg-primary border-b text-white'>
      {getLeftWidgets()}
      <div className='flex-1'>
        <a className='btn btn-ghost normal-case text-xl'>BeeChase</a>
      </div>
      <div className='flex-none'>{getRightWidgets()}</div>
    </nav>
  );
}
