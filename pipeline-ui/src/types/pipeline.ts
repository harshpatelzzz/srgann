export type PipelineStepId =
  | 'upload'
  | 'frontend'
  | 'backend'
  | 'preprocessing'
  | 'generator'
  | 'discriminator'
  | 'postprocessing'
  | 'output'

export const PIPELINE_STEPS: PipelineStepId[] = [
  'upload',
  'frontend',
  'backend',
  'preprocessing',
  'generator',
  'discriminator',
  'postprocessing',
  'output',
]

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed'

export type GeneratorSubStage = 'feature' | 'residual' | 'upsampling'
