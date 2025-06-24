---
trigger: model_decision
description: Command definition: /standby
globs: 
---
# Command definition: `/standby`

Tasks
- Check git status
- Ensure there are no merge conflicts, commit all relevant changes
- Generate commit message according to [commit-messages.mdc](mdc:.cursor/rules/commit-messages.mdc)
- Create commit, push to correct remote.