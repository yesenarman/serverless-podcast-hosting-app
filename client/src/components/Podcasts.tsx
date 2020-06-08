import { History } from 'history'
import * as React from 'react'
import update from 'immutability-helper'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Checkbox
} from 'semantic-ui-react'

import Auth from '../auth/Auth'
import { Podcast } from '../types/Podcast'
import { createPodcast, deletePodcast, getPodcasts, patchPodcast } from '../api/podcasts-api'
import { Link } from 'react-router-dom'

interface PodcastsProps {
  auth: Auth
  history: History
}

interface PodcastsState {
  podcasts: Podcast[]
  newPodcastName: string
  newPodcastHostName: string
  newPodcastDescription: string
  loadingPodcasts: boolean
}

export class Podcasts extends React.PureComponent<PodcastsProps, PodcastsState> {
  state: PodcastsState = {
    podcasts: [],
    newPodcastName: '',
    newPodcastHostName: '',
    newPodcastDescription: '',
    loadingPodcasts: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPodcastName: event.target.value })
  }

  handleHostNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPodcastHostName: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPodcastDescription: event.target.value })
  }

  onEditButtonClick = (podcastId: string) => {
    this.props.history.push(`/podcasts/${podcastId}/edit`)
  }

  onPodcastCreate = async () => {
    try {
      const newPodcast = await createPodcast(this.props.auth.getIdToken(), {
        name: this.state.newPodcastName,
        hostName: this.state.newPodcastHostName,
        description: this.state.newPodcastDescription,
      })
      this.setState({
        podcasts: [...this.state.podcasts, newPodcast],
        newPodcastName: ''
      })
    } catch {
      alert('Podcast creation failed')
    }
  }

  onPodcastDelete = async (podcastId: string) => {
    try {
      await deletePodcast(this.props.auth.getIdToken(), podcastId)
      this.setState({
        podcasts: this.state.podcasts.filter(podcast => podcast.podcastId != podcastId)
      })
    } catch {
      alert('Podcast deletion failed')
    }
  }

  onPublicCheck = async (pos: number) => {
    try {
      const podcast = this.state.podcasts[pos]
      await patchPodcast(this.props.auth.getIdToken(), podcast.podcastId, {
        name: podcast.name,
        hostName: podcast.hostName,
        description: podcast.description,
        isPublic: podcast.isPublic
      })
      this.setState({
        podcasts: update(this.state.podcasts, {
          [pos]: { isPublic: { $set: !podcast.isPublic } }
        })
      })
    } catch {
      alert('Podcast patch failed')
    }
  }

  async componentDidMount() {
    try {
      const podcasts = await getPodcasts(this.props.auth.getIdToken())
      this.setState({
        podcasts: podcasts,
        loadingPodcasts: false,
        newPodcastName: '',
        newPodcastHostName: '',
        newPodcastDescription: '',
      })
    } catch (e) {
      alert(`Failed to fetch podcasts: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Your Podcasts</Header>

        {this.renderCreatePodcastInput()}

        {this.renderPodcasts()}
      </div>
    )
  }

  renderCreatePodcastInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            fluid
            placeholder="Name"
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Input
            fluid
            placeholder="Host name"
            onChange={this.handleHostNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Input
            fluid
            placeholder="Description"
            onChange={this.handleDescriptionChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Button
            placeholder="Description"
            onClick={() => this.onPodcastCreate()}
          >Add podcast</Button>
        </Grid.Column>
        
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderPodcasts() {
    if (this.state.loadingPodcasts) {
      return this.renderLoading()
    }

    return this.renderPodcastsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Podcasts
        </Loader>
      </Grid.Row>
    )
  }

  renderPodcastsList() {
    return (
      <Grid padded>
        {this.state.podcasts.map((podcast, pos) => {
          return (
            <Grid.Row key={podcast.podcastId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onPublicCheck(pos)}
                  checked={podcast.isPublic}
                />
              </Grid.Column>

              {podcast.coverImageUrl && (
                <Grid.Column width={4} verticalAlign="middle">
                  <Image src={podcast.coverImageUrl} size="small" wrapped />
                </Grid.Column>
              )}
              <Grid.Column width={podcast.coverImageUrl ? 4 : 6} verticalAlign="middle">
                <Link to={`/podcasts/${podcast.podcastId}/episodes`}>
                  {podcast.name}
                </Link>
              </Grid.Column>
              <Grid.Column width={podcast.coverImageUrl ? 4 : 6} verticalAlign="middle">
                Hosted by {podcast.hostName}
              </Grid.Column>
              <Grid.Column width={1} floated="right" verticalAlign="middle">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(podcast.podcastId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right" verticalAlign="middle">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onPodcastDelete(podcast.podcastId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                {podcast.description}
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
