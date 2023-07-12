import OptionsSync from 'webext-options-sync'

export default new OptionsSync({
  defaults: {
    full_layout: true,
    force_video_quality: true,
    video_quality: '1080p',
    save_last_timestamp: true,
    theater_mode: true,
    force_audio_playback_rate: false,
    audio_playback_rate: 1.0
  },
  migrations: [
    OptionsSync.migrations.removeUnused
  ],
  logging: true
})
