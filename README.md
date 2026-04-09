# Directify CLI

Official command-line tool for [Directify](https://directify.app) - manage your directory websites, listings, categories, tags, and articles from the terminal.

## Installation

```bash
npm install -g directify-cli
```

Or run directly with npx:

```bash
npx directify-cli --help
```

## Quick Start

### 1. Get your API token

Go to your Directify dashboard: **Settings > API** and generate a new token.

### 2. Authenticate

```bash
directify auth login YOUR_API_TOKEN
```

### 3. Set your default directory

```bash
# List your directories to find the ID
directify directories list

# Set the default so you don't need --directory on every command
directify config set-directory 123
```

### 4. Start managing

```bash
# List listings
directify listings list

# Create a listing
directify listings create --name "Bella Trattoria" --description "Authentic Italian cuisine" --address "123 Main St"

# Create a category
directify categories create --title "Italian" --icon "🍝"
```

## Commands

### Authentication

```bash
directify auth login <token>    # Authenticate with your API token
directify auth logout           # Remove stored token
directify auth status           # Check authentication status
```

### Configuration

```bash
directify config set-directory <id>   # Set default directory
directify config get-directory        # Show default directory
```

### Directories

```bash
directify directories list            # List all your directories
directify dirs ls                     # Short alias
directify dirs ls --json              # Output as JSON
```

### Categories

```bash
# List
directify categories list
directify cats ls --json

# Create
directify categories create --title "Italian" --icon "🍝" --description "Italian restaurants"
directify categories create --title "Japanese" --parent-id 5 --order 2

# Update
directify categories update 42 --title "Italian Cuisine" --order 1

# Delete
directify categories delete 42

# Get details
directify categories get 42
```

### Tags

```bash
# List
directify tags list
directify tags ls --json

# Create
directify tags create --title "Featured" --color "#f59e0b" --text-color "#ffffff"
directify tags create --title "New" --heroicon "heroicon-o-sparkles"

# Update
directify tags update 10 --title "Hot" --color "#ef4444"

# Delete
directify tags delete 10
```

### Custom Fields

```bash
directify fields list                 # List all custom fields
directify fields ls --json            # Output as JSON
```

### Listings

```bash
# List (paginated)
directify listings list
directify listings list --page 2
directify listings ls --json

# Get a specific listing
directify listings get 456

# Create
directify listings create \
  --name "Bella Trattoria" \
  --url "https://bellatrattoria.com" \
  --description "Authentic Italian cuisine" \
  --address "123 Main Street, New York" \
  --phone "+1-212-555-1234" \
  --email "info@bellatrattoria.com" \
  --categories 1,5,12 \
  --tags 3,7 \
  --featured \
  --field "price_range=2" \
  --field "cuisine_type=Italian, Pasta"

# Update
directify listings update 456 \
  --name "Bella Trattoria NYC" \
  --featured true \
  --field "hours_of_operation=Mon | 11:00 - 22:00"

# Delete
directify listings delete 456

# Check if URL exists
directify listings exists --url "https://example.com"

# Bulk create from JSON file
directify listings bulk-create --file ./listings.json
```

#### Bulk Create JSON Format

Create a JSON file with an array of listings:

```json
{
  "listings": [
    {
      "name": "Restaurant One",
      "url": "https://restaurant-one.com",
      "description": "Great food",
      "categories": [1, 2],
      "tags": [3],
      "price_range": "2",
      "cuisine_type": "Italian"
    },
    {
      "name": "Restaurant Two",
      "url": "https://restaurant-two.com",
      "description": "Amazing sushi",
      "categories": [3],
      "cuisine_type": "Japanese"
    }
  ]
}
```

Then run:

```bash
directify listings bulk-create --file ./listings.json
```

### Articles

```bash
# List
directify articles list
directify articles list --page 2 --json

# Get
directify articles get 789

# Create
directify articles create \
  --title "Best Italian Restaurants in NYC" \
  --markdown "# Top Picks\n\nHere are our favorites..." \
  --categories "Reviews,Italian" \
  --thumbnail-url "https://example.com/image.jpg" \
  --seo-title "Best Italian Restaurants" \
  --seo-description "Discover the top Italian restaurants in New York City"

# Update
directify articles update 789 --title "Updated Title" --active true

# Toggle active/inactive
directify articles toggle 789

# Delete
directify articles delete 789

# Check if slug exists
directify articles exists --slug "best-italian-restaurants"
```

### Custom Pages

```bash
# List
directify pages list
directify pages ls --json

# Get
directify pages get 12

# Create a page in the navbar
directify pages create \
  --title "About Us" \
  --markdown "# About Us\n\nWe are a directory of the best restaurants..." \
  --placement navbar \
  --seo-title "About Us" \
  --seo-description "Learn about our restaurant directory"

# Create a programmatic SEO page (unlisted by default)
directify pages create \
  --title "NYC vs Chicago Pizza" \
  --markdown "# NYC vs Chicago Pizza\n\nA detailed comparison..." \
  --seo-title "Best Pizza: NYC vs Chicago Compared" \
  --seo-description "Compare pizza styles between New York and Chicago"

# Create a footer link
directify pages create \
  --title "Terms of Service" \
  --markdown "# Terms of Service\n\n..." \
  --placement footer \
  --order 1

# Create an external link in the navbar
directify pages create \
  --title "Submit a Listing" \
  --external-url "https://forms.google.com/your-form" \
  --placement navbar \
  --new-tab

# Update
directify pages update 12 --title "Updated Title" --placement footer

# Toggle published/unpublished
directify pages toggle 12

# Delete
directify pages delete 12
```

## Global Options

All resource commands support these options:

| Option | Description |
|--------|-------------|
| `-d, --directory <id>` | Directory ID (overrides default) |
| `--json` | Output as JSON (on list commands) |
| `--help` | Show help for a command |

## Custom Fields

When creating or updating listings, you can set custom field values using the `--field` flag:

```bash
directify listings create \
  --name "My Restaurant" \
  --field "price_range=3" \
  --field "cuisine_type=Italian, Pizza" \
  --field "hours_of_operation=Mon | 11:00 - 22:00
Tue | 11:00 - 22:00
Wed | Closed" \
  --field "menu_highlights=Carbonara | Classic Roman pasta | \$22
Margherita | Fresh mozzarella | \$18"
```

Use `directify fields list` to see available custom fields and their names.

## Using with LLMs / AI Agents

The CLI is designed to work well with AI-powered workflows. Use `--json` output for machine-readable responses:

```bash
# Get all listings as JSON for processing
directify listings list --json | jq '.data[].name'

# Pipe data between commands
directify listings get 456 --json | jq '.categories'
```

## Rate Limits

The API allows **120 requests per minute** per directory. If you hit the rate limit, the CLI will show an error message. Implement delays between requests for bulk operations.

## Configuration Storage

The CLI stores your auth token and default directory in your system's config directory:

- **macOS**: `~/Library/Preferences/directify-cli-nodejs/`
- **Linux**: `~/.config/directify-cli-nodejs/`
- **Windows**: `%APPDATA%/directify-cli-nodejs/`

## Troubleshooting

### "Not authenticated" error
Run `directify auth login <token>` with your API token from Settings > API.

### "No directory specified" error
Either pass `--directory <id>` or set a default: `directify config set-directory <id>`

### "Rate limit exceeded" error
Wait a moment and retry. The limit is 120 requests per minute per directory.

### "Validation error"
Check the error details for which fields failed validation. Use `directify fields list` to see available custom field names.

## License

MIT
