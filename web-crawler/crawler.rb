require 'watir'
require 'headless'

class Crawler

    @@processed = []
    @@skip = ['checkout', 'signin', 'cart']

    def process_link(hostname, target_link, browser)
        target_link = target_link.split('#')[0]
        puts "received #{target_link}"
        if target_link.kind_of?(String) && !@@processed.include?(target_link) && target_link.start_with?(hostname) && !skip?(target_link)
            puts "--> processing #{target_link}"
            browser.goto(target_link)

            begin
                `node ../prerender-runner/index.js #{target_link} &`
                sleep 5
            rescue => error
                puts "Error: #{error.message}"
            end
            @@processed.push(target_link)
            browser.links.each do |link|
                process_link(hostname, link.href, browser)
            end
        end
    end

    def skip?(link)
        @@skip.map do |term|
            return true if link.include?(term) 
        end
        return false 
    end

end

browser = Watir::Browser.new :chrome, headless: true

crawler = Crawler.new


#crawler.process_link('https://www.kohls.com', 'https://www.kohls.com/feature/sitemapmain.jsp', browser)
crawler.process_link('https://www.brooksrunning.com', 'https://www.brooksrunning.com/en_us/sitemap/', browser)
#crawler.process_link('https://cars.edgecloud9.com', 'https://cars.edgecloud9.com/', browser)