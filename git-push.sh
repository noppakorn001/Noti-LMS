#!/bin/bash
# Push Noti-LMS to GitHub

echo "==================================================="
echo "Pushing Noti-LMS to GitHub..."
echo "==================================================="

if ! command -v git &> /dev/null; then
    echo "Error: git is not installed or not in PATH."
    exit 1
fi

echo ""
echo "Checking Git status..."
git status

echo ""
echo "Staging changes (git add .)..."
git add .

# Check if commit message was passed as argument
commit_msg="$1"

if [ -z "$commit_msg" ]; then
    echo ""
    read -p "Enter commit message (or press Enter for 'Update project files'): " commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="Update project files"
    fi
fi

echo ""
echo "Committing with message: '$commit_msg'..."
git commit -m "$commit_msg"

echo ""
echo "Pushing to GitHub (main branch)..."
git push -u origin main

echo ""
echo "==================================================="
echo "Done!"
echo "==================================================="
