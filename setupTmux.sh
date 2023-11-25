tmux rename-window server
tmux neww -dnroot
tmux neww -dnbackend -c./backend
tmux neww -dnfrontend -c./backend/frontend

tmux source ~/.tmux.conf
