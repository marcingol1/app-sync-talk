/**
 * React Native DataStore Sample App
 */

import React, {Component} from 'react';
import {Text, StyleSheet, ScrollView} from 'react-native';

import Amplify from '@aws-amplify/core';
import {DataStore, Predicates} from '@aws-amplify/datastore';
import {Post, PostStatus, Comment} from './src/models';

import awsConfig from './aws-exports';
Amplify.configure(awsConfig);
let subscription;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
    };
  }

  componentDidCatch(error) {
    console.log({error});
  }

  componentDidMount() {
    this.onQuery();
    subscription = DataStore.observe(Post).subscribe(msg => {
      console.log('SUBSCRIPTION_UPDATE', msg);
      this.onQuery();
    });
  }

  componentWillUnmount() {
    subscription.unsubscribe();
  }

  onCreatePost() {
    DataStore.save(
      new Post({
        title: `New Post ${Date.now()}`,
        rating: (function getRandomInt(min, max) {
          min = Math.ceil(min);
          max = Math.floor(max);
          return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
        })(5, 10),
        status: PostStatus.ACTIVE,
      }),
    );
  }

  async onCreatePostAndComments() {
    // const post = new Post({
    //   title: `New Post with comments ${Date.now()}`,
    //   rating: 5,
    //   status: PostStatus.ACTIVE,
    // });
    // await DataStore.save(post);
    // for (let i = 0; i < 2; i++) {
    //   DataStore.save(
    //     new Comment({
    //       content: `New comment ${Date.now()}`,
    //       post,
    //     }),
    //   );
    // }
  }

  onQuery = async () => {
    const posts = await DataStore.query(Post, c => c.rating('gt', 2));
    console.log('QUERY_POSTS_RESULT', posts);
    // const comments = await DataStore.query(Comment);
    this.setState({posts});
    // console.log('QUERY_COMMENTS_RESULT', comments);
  };

  onDelete = async () => {
    const deletedPosts = await DataStore.delete(Post, Predicates.ALL);
    console.log('DELETE_RESULT', deletedPosts);
  };

  render() {
    return (
      <ScrollView
        style={styles.scrollview}
        contentContainerStyle={styles.container}>
        <Text style={styles.text} onPress={this.onCreatePost}>
          Create Post
        </Text>
        <Text style={styles.text} onPress={this.onCreatePostAndComments}>
          Create Post & Comments
        </Text>
        <Text style={styles.text} onPress={this.onQuery}>
          Query Posts
        </Text>
        <Text style={styles.text} onPress={this.onDelete}>
          Delete All Posts
        </Text>
        {this.state.posts.map((post, i) => (
          <Text key={i}>{`${post.title} ${post.rating}`}</Text>
        ))}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scrollview: {
    paddingTop: 40,
    flex: 1,
  },
  container: {
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});

export default App;