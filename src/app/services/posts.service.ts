import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from '../shared/posts.model';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, public snackBar: MatSnackBar, private router: Router) { }

  getPosts() {
    this.http.get<{message: string, posts: any}>('http://localhost:3030/api/posts')
      .pipe(map((postData) => {
        return postData.posts.map(post => {
          return {
            name: post.name,
            email: post.email,
            id: post._id,
            title: post.title,
            content: post.content,
            imagePath: post.imagePath
          };
        });
      }))
      .subscribe((posts) => {
        // the same posts that came after map
        this.posts = posts;
        this.postsUpdated.next([...this.posts]);
    });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{post: Post}>('http://localhost:3030/api/posts/' + id);
  }

  addPost(post) {
    const postData = new FormData();
    postData.append('name', post.name);
    postData.append('email', post.email);
    postData.append('title', post.title);
    postData.append('content', post.content);
    postData.append('image', post.image, post.title);
    this.http.post<{message: string, post: Post}>('http://localhost:3030/api/posts', postData)
      .subscribe((responseData) => {
        const id = responseData.post.id;
        post.id = id;
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        this.snackBar.open(responseData.message, 'Okay!', {
          duration: 2500,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.router.navigate(['/']);
    });
  }

  updatePost(id: string, post) {
    let postData: Post | FormData;
    if (typeof(post.image) === 'object') {
      postData = new FormData();
      postData.append('name', post.name);
      postData.append('email', post.email);
      postData.append('id', id);
      postData.append('title', post.title);
      postData.append('content', post.content);
      postData.append('image', post.image, post.title);
    } else {
      postData = {
        name: post.name,
        email: post.email,
        id: id,
        title: post.title,
        content: post.content,
        imagePath: post.imagePath
      };
    }
    console.log(post.image);
    console.log(post.imagePath);
    this.http.put<{message: string}>('http://localhost:3030/api/posts/' + id, postData)
      .subscribe((response) => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
        const post_new: Post = {
          name: post.name,
          email: post.email,
          id: id,
          title: post.title,
          content: post.content,
          imagePath: ''
        };
        updatedPosts[oldPostIndex] = post_new;
        this.posts = updatedPosts;
        this.snackBar.open(response.message, 'Okay!', {
          duration: 2500,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
    });
  }

  deletePost(id: string) {
    this.http.delete<{message: string}>('http://localhost:3030/api/posts/' + id)
      .subscribe((responsemsg) => {
        const updatedPosts = this.posts.filter(post => post.id !== id);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        console.log(responsemsg.message);
        this.snackBar.open(responsemsg.message, 'Okay!', {
          duration: 2500,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
    });
  }
}
