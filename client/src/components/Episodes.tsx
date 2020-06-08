import { History } from 'history'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Loader
} from 'semantic-ui-react'

import Auth from '../auth/Auth'
import { Episode } from '../types/Episode'
import { createEpisode, deleteEpisode, getEpisodes } from '../api/episodes-api'

interface EpisodesProps {
  auth: Auth
  history: History
  match: {
    params: {
      podcastId: string
    }
  }
}

interface EpisodesState {
  episodes: Episode[]
  newEpisodeName: string
  newEpisodeDescription: string
  loadingEpisodes: boolean
}

export class Episodes extends React.PureComponent<EpisodesProps, EpisodesState> {
  state: EpisodesState = {
    episodes: [],
    newEpisodeName: '',
    newEpisodeDescription: '',
    loadingEpisodes: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newEpisodeName: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newEpisodeDescription: event.target.value })
  }

  onEditButtonClick = (episodeId: string) => {
    const podcastId = this.props.match.params.podcastId
    this.props.history.push(`/podcasts/${podcastId}/episodes/${episodeId}/edit`)
  }

  onEpisodeCreate = async () => {
    try {
      const newEpisode = await createEpisode(
        this.props.auth.getIdToken(), 
        this.props.match.params.podcastId,
        {
          name: this.state.newEpisodeName,
          description: this.state.newEpisodeDescription,
        }
      )
      this.setState({
        episodes: [...this.state.episodes, newEpisode],
        newEpisodeName: ''
      })
    } catch {
      alert('Episode creation failed')
    }
  }

  onEpisodeDelete = async (episodeId: string) => {
    try {
      await deleteEpisode(this.props.auth.getIdToken(), this.props.match.params.podcastId, episodeId)
      this.setState({
        episodes: this.state.episodes.filter(episode => episode.episodeId != episodeId)
      })
    } catch {
      alert('Episode deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const episodes = await getEpisodes(this.props.auth.getIdToken(), this.props.match.params.podcastId)
      this.setState({
        episodes,
        loadingEpisodes: false,
        newEpisodeName: '',
        newEpisodeDescription: '',
      })
    } catch (e) {
      alert(`Failed to fetch episodes: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Podcast episodes</Header>

        {this.renderCreateEpisodeInput()}

        {this.renderEpisodes()}
      </div>
    )
  }

  renderCreateEpisodeInput() {
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
            placeholder="Description"
            onChange={this.handleDescriptionChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Button
            placeholder="Description"
            onClick={() => this.onEpisodeCreate()}
          >Add episode</Button>
        </Grid.Column>
        
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderEpisodes() {
    if (this.state.loadingEpisodes) {
      return this.renderLoading()
    }

    return this.renderEpisodesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading podcast episodes
        </Loader>
      </Grid.Row>
    )
  }

  renderEpisodesList() {
    return (
      <Grid padded>
        {this.state.episodes.map((episode, pos) => {
          return (
            <Grid.Row key={episode.episodeId}>
              <Grid.Column width={7} floated="right">
                {episode.name}
              </Grid.Column>
              <Grid.Column width={7} floated="right">
                {episode.description}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(episode.episodeId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onEpisodeDelete(episode.episodeId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {episode.audioUrl && (
                <Grid.Column width={16}>
                  <audio
                    controls
                    src={episode.audioUrl}>
                      Your browser does not support the
                      <code>audio</code> element.
                  </audio>
                </Grid.Column>
              )}
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
