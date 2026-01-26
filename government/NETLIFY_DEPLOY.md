# Netlify Deployment Guide - Government Panel

## Deployment Steps

1. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Select the `government` folder as the base directory

2. **Build Settings**
   - **Base directory**: `government`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `government/dist`

3. **Environment Variables**
   Add these in Netlify → Site settings → Environment variables:
   ```
   VITE_API_URL=https://uchqun-production.up.railway.app/api
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Your site will be live at `https://your-site-name.netlify.app`

## Important Notes

- The `netlify.toml` file is already configured for SPA routing
- All routes will redirect to `/index.html` for proper React Router functionality
- Make sure the build completes successfully before accessing the site

## Troubleshooting

If you see a blank page:

1. **Check Build Logs**: Go to Netlify → Deploys → Click on the latest deploy → View build logs
2. **Check Console**: Open browser DevTools → Console tab → Look for errors
3. **Verify Environment Variables**: Make sure `VITE_API_URL` is set correctly
4. **Clear Cache**: Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
5. **Check Network Tab**: Verify that assets are loading correctly

## Common Issues

### Blank Page
- **Cause**: Build failed or assets not loading
- **Solution**: Check build logs and verify `netlify.toml` exists

### 404 on Refresh
- **Cause**: Missing redirect rules
- **Solution**: Ensure `netlify.toml` has the redirect rule: `from = "/*" to = "/index.html"`

### API Errors
- **Cause**: Wrong API URL or CORS issues
- **Solution**: Verify `VITE_API_URL` environment variable is correct
