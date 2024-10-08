# Punkmade

A social media site aimed at providing a better platform for punk and other alternative scenes to share information about news, music, events, and political action without the greedy addictive nature of other social media sites

## What makes this different

- Everything is broken up into scenes which are based in a city and state within the US in an effort for the site to mirror actual subculture movements in america

- No likes, no stats, no notifs. The main goal is to allow people to find, view, save, and discuss content about their local scene while detaching the element of number go up, addictive reward cycle nonsense associated with most social media sites

- Real time, everything happens in real time using phoenix liveviews and pubsub allowing for realtime discussions of content on the site as well as being able to see new content as it is posted

- Tag system to organize content, no reliance on algorithms to guess what you want. Punkmade is about looking for what you want and finding it easily to stay up to date with what you care about, not having what you care about and want to see perscribed to you by an algorithm

## Tech at play

This site uses Phoenix with Ecto and Postgresql for the data base as well as various Oauth2 providers for authentication, and the google locations API to verify the existence of cities within a state

## TODO:

- [ ] Posts
  - [ ] Complete post creation
  - [ ] Support images
  - [ ] Support videos
- [ ] Auth
  - [ ] Keep alive in all liveviews
  - [ ] Keep alive on navigation
  - [ ] Support more providers
  - [ ] Add Auth0 support
