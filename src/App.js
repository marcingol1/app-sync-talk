import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

import Amplify from '@aws-amplify/core';
import { DataStore, Predicates } from '@aws-amplify/datastore';
import { Post, PostStatus } from './models';

//Use next two lines only if syncing with the cloud
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

function onCreate() {
  DataStore.save(
    new Post({
      title: `New title ${Date.now()}`,
      rating: (function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
      })(1, 7),
      status: PostStatus.ACTIVE
    })
  );
}

function onDeleteAll() {
  DataStore.delete(Post, Predicates.ALL);
}

function App() {
  const [posts, setPosts] = useState([]);

  async function onQuery() {
    const data = await DataStore.query(Post, c => c.rating('gt', 1));
    console.log({ data });
    setPosts(data);
  }

  useEffect(() => {
    onQuery();
    const subscription = DataStore.observe(Post).subscribe(msg => {
      console.log(msg.model, msg.opType, msg.element);
      onQuery();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <input
            type="button"
            value="NEW"
            onClick={async () => {
              onCreate();
            }}
          />
          <input type="button" value="DELETE ALL" onClick={onDeleteAll} />
          <input type="button" value="QUERY rating > 4" onClick={onQuery} />
        </div>
        <main>
          <ul>
            {posts.map(post => (
              <li>
                {post && post.title} - {post && post.rating}
              </li>
            ))}
          </ul>
        </main>
      </header>
    </div>
  );
}

export default App;
