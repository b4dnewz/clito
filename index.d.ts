type FlagTypes = 'boolean' | 'string' | 'number'

interface Flag {

  /**
   * Defines the flag type
   * this is the type of the returning parsed flag value
   */
  type: FlagTypes

  /**
   * Defines the flag description
   * used in built-in help message generation
   */
  description?: string

  /**
   * Defines the flag alias
   */
  alias?: string

  /**
   * Defines the flag default values in case is empty
   */
  default?: any

  /**
   * Defines a custom option argument validation function
   * if the function return false or string
   * a validation error is raised
   */
  validation?: (input: string) => boolean|string

  /**
   * Defines the flag as required
   * if values is undefined after parsing
   * it will raise an error
   */
  required?: boolean

  /**
   * Defines the flag as multiple
   * and it's parsed as an array
   */
  multiple?: boolean

}

interface FlagOptions {
  [key: string]: Flag
}

export interface Options {

  /**
   * The command flags definitions
   */
  flags: FlagOptions

  /**
   * Set the command banner
   * displayed in in built-in help message
   * on top of other help sections
   */
  banner?: string

  /**
   * Set custom usage string
   */
  usage?: string

  /**
   * Set custom command name
   * used in usage string and command version
   */
  name?: string

  /**
   * Set custom command version
   * used in usage string and command version
   */
  version?: string

  /**
   * Set custom command description
   * used in built-in help message
   */
  description?: string

  /**
   * Set custom command examples
   * used in built-in help message
   */
  examples?: string|string[]

  /**
   * Set the indentation used in command help message
   */
  indentation?: number

  /**
   * Enable or disable built-in version message
   */
  showVersion?: boolean

  /**
   * Enable or disable built-in help message generation
   */
  showHelp?: boolean

}

export interface Result {

  /**
   * Command input
   */
  input: string[]

  /**
   * Parsed command options
   */
  flags: {
    [name: string]: any
  }

}

export default function clito(options: Options): Result;
