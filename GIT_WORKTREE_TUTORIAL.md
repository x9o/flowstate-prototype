# Collaborative AI Development: Using Git Worktrees for Parallel Work

When using multiple AI coding assistants (like Claude Code, Codex, or Gemini) on a single repository, a common problem arises: they can easily overwrite each other's changes. This happens when both instances work on the same branch in the same directory.

The solution is to provide each AI instance with its own isolated working environment that is still connected to the main repository. While you could clone the repository multiple times, this is inefficient and consumes unnecessary disk space.

A much better solution is `git worktree`.

## What is `git worktree`?

`git worktree` is a powerful Git command that allows you to have multiple working trees (directories) attached to a single Git repository. This means you can have different branches checked out in different directories simultaneously, all sharing the same underlying Git database.

**Benefits for Collaborative AI:**

*   **Isolation:** Each AI instance works in its own directory and on its own branch, preventing any chance of overwriting another instance's work.
*   **Efficiency:** All worktrees share a single `.git` database, saving significant disk space compared to cloning the repository multiple times.
*   **Streamlined Integration:** Since each worktree is just another branch in your main repository, you can use standard Git commands (`merge`, `rebase`, `cherry-pick`) to review and integrate the AI-generated changes.
*   **Simultaneous Work:** You can have one AI instance refactoring code in one worktree, another adding a new feature in a second worktree, while you continue your own work in the main directory.

---

## Tutorial: How to Use `git worktree` with Multiple AI Instances

Let's walk through how to set this up for your `flowstate-ui` project.

### Prerequisites

*   A single, existing Git repository (e.g., `C:\Users\user\Desktop\flowstate-ui`).

### Step 1: Your Main Working Directory

Your main project directory is already your first worktree. You can continue to use this for your own development work.

```bash
# You are here
C:\Users\user\Desktop\flowstate-ui
```

### Step 2: Create a Worktree for the First AI Instance

Let's create a new, separate directory for your first AI assistant. We'll create a new branch for it at the same time.

Open a terminal in your main project directory (`flowstate-ui`) and run the following command:

```bash
git worktree add -b ai-instance-1 ../flowstate-ui-ai1
```

Let's break down this command:
*   `git worktree add`: The command to create a new worktree.
*   `-b ai-instance-1`: Creates a **new branch** named `ai-instance-1` for this worktree.
*   `../flowstate-ui-ai1`: Creates a **new directory** named `flowstate-ui-ai1` one level up from your current location. This is where the new branch will be checked out. Keeping it outside the main project folder is crucial to avoid confusion.

You now have a new folder structure:

```
Desktop/
├── flowstate-ui/      (Your main worktree, probably on the 'main' or 'dev' branch)
└── flowstate-ui-ai1/  (The new worktree for the first AI, on the 'ai-instance-1' branch)
```

### Step 3: Instruct the First AI Instance

Now, direct your first AI coding assistant to work within the **new directory**:

`C:\Users\user\Desktop\flowstate-ui-ai1`

This AI will now read and write files only within that folder, committing its changes to the `ai-instance-1` branch, leaving your main directory untouched.

### Step 4: Repeat for a Second AI Instance

To spin up a second AI assistant, simply repeat the process with a different branch and directory name.

```bash
# Run this from your main `flowstate-ui` directory
git worktree add -b ai-instance-2 ../flowstate-ui-ai2
```

You now have three separate working directories, all linked to the same repository:

```
Desktop/
├── flowstate-ui/
├── flowstate-ui-ai1/  (For AI #1, on branch 'ai-instance-1')
└── flowstate-ui-ai2/  (For AI #2, on branch 'ai-instance-2')
```

Instruct your second AI to use the `C:\Users\user\Desktop\flowstate-ui-ai2` directory.

### Step 5: See All Your Worktrees

To see a list of all active worktrees, run this command from any of them:

```bash
git worktree list
```

The output will look something like this:

```
C:/Users/user/Desktop/flowstate-ui        a1b2c3d [main]
C:/Users/user/Desktop/flowstate-ui-ai1    e4f5g6h [ai-instance-1]
C:/Users/user/Desktop/flowstate-ui-ai2    i7j8k9l [ai-instance-2]
```

### Step 6: Review and Integrate AI Changes

The AI instances will commit their work to their respective branches (`ai-instance-1`, `ai-instance-2`). To integrate their work, go to your main worktree and use standard Git commands.

For example, to merge the work from the first AI:

```bash
# Navigate to your main project directory
cd C:\Users\user\Desktop\flowstate-ui

# Fetch the latest changes from all branches
git fetch

# Merge the AI's branch into your current branch
git merge ai-instance-1
```

You can also use `git cherry-pick` to select specific commits or `git rebase` for a cleaner history.

### Step 7: Clean Up a Worktree

Once an AI has finished its task and you've merged its work, you can clean up the worktree.

1.  **Remove the worktree directory:**
    ```bash
    # Run from the main directory
    git worktree remove ../flowstate-ui-ai1
    ```
    *Note: Git will prevent you from removing a worktree with uncommitted changes. Use `--force` to override this.*

2.  **Delete the branch (optional):**
    Removing the worktree does **not** delete the branch. If you no longer need it, you can delete it manually:
    ```bash
    git branch -d ai-instance-1
    ```

---

## Conclusion

By using `git worktree`, you can effectively manage multiple AI coding assistants working on the same codebase in parallel. This method provides perfect isolation, prevents conflicts, and uses standard Git workflows for seamless integration, making your collaborative AI development process much more efficient and organized.
