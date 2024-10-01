require 'watir'
require 'headless'

browser = Watir::Browser.new :chrome, headless: true

def process_link(hostname, target_link, browser)
    if target_link.start_with?(hostname)
        browser.goto target_link
        browser.links.each do |link|
            `node ../prerender-runner/index.js #{target_link}`
            sleep 10
            process_link(hostname, link, browser)
        end
    end
end

#process_link('https://www.brooksrunning.com', 'https://www.brooksrunning.com/en_us/sitemap/', browser)
process_link('https://cars.edgecloud9.com', 'https://www.edgecloud9.com/', browser)
