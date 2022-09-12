import { NextPage } from 'next';
import Layout from '../widgets/Layout';

const GlobalLeaderboardPage: NextPage = () => {
  return (
    <Layout title='Global Leaderboard'>
      <div className='form-control w-full'>
        <label className='label'>
          <span className='label-text'>Leaderboard tags:</span>
        </label>
        <select className='select select-bordered'>
          <option disabled selected>
            Pick one
          </option>
          <option>Star Wars</option>
          <option>Harry Potter</option>
          <option>Lord of the Rings</option>
          <option>Planet of the Apes</option>
          <option>Star Trek</option>
        </select>
      </div>
    </Layout>
  );
};

export default GlobalLeaderboardPage;
