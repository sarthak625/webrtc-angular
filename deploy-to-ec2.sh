ssh -t personalec2 "rm -rf /home/ubuntu/video-calling-app"
ng build --prod --base-href /vca --deploy-url /vca/
scp -i ~/ssh-keys/free-tier-server.pem -r /Users/sarthaknegi/code/personal/projects/video-calling-app/dist/video-calling-app/ ubuntu@3.109.145.193:/home/ubuntu/video-calling-app/