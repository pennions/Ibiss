export class TestTools
{
    CLEAN_HTML_REGEX = '/[>](\s+)[<]/m';

    static cleanHtml(template)
    {
        template = template.trim();
        template = template.replace(/\n/g, '');
        template = template.replace(/\r/g, '');
        template = template.replace(TestTools.CLEAN_HTML_REGEX, '><');
        template = template.replace(/\s{2,}/g, "");

        return template;
    }
}
