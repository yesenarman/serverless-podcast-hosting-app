# Serverless Podcast Management App
My Capstone project for the Udacity Cloud Developer Nanodegree

## Functionality of the application
This application will allow creating/removing/updating/fetching podcasts and also episodes for each podcast.
A user can upload a cover image for a podcast. A user can also upload an audio file for each episode.

## Podcast items
For each podcast item the following fields are stored:
- `userId` (string) - id of the owner user of a podcast
- `podcastId` (string) - globally unique id of a podcast
- `createdAt` (string) - date and time when a podcast was created
- `name` (string) - name of a podcast
- `hostName` (string) - name of a person hosting a podcast
- `description` (string) - a short text about a podcast
- `coverImageUrl` (string) (optional) - a URL pointing to a cover image of the podcast
- `isPublic` (boolean) - true if a podcast should be publicly accessable

## Episode items
For each episode item the following fields are stored:
- `podcastId` (string) - id of the podcast to which this episode belongs
- `createdAt` (string) - date and time when an episode was created
- `name` (string) - name of an episode
- `description` (string) - a short text about an episode
- `audioUrl` (string) (optional) - a URL pointing to an audio file with a recording of an episode

## Deploying backend
```
cd backend
npm install
sls deploy -v
```

## Running client locally
```
cd client
npm install
npm start
```
